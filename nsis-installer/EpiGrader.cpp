#include <windows.h>
#include <shellapi.h>
#include <string>
#include <fstream>
#include <json/json.h>

#pragma comment(lib, "shell32.lib")
#pragma comment(lib, "user32.lib")

// Resource defines
#define IDI_APP_ICON 101
#define IDR_SPLASH 102

// Window class name
const wchar_t* CLASS_NAME = L"EpiGraderWindow";
const wchar_t* WINDOW_TITLE = L"EpiGrader - AI Code Grader";

// Global handles
HWND g_hwnd = NULL;
HWND g_progress = NULL;
HWND g_status = NULL;
HWND g_apiKeyInput = NULL;
HWND g_saveBtn = NULL;

// Paths
std::wstring g_appDir;
std::wstring g_nodePath;
std::wstring g_backendPath;
std::wstring g_configPath;

// Process handle
HANDLE g_backendProcess = NULL;

// Forward declarations
BOOL InitializePaths();
BOOL LoadConfig(Json::Value& config);
BOOL SaveConfig(const Json::Value& config);
void ShowSetupDialog();
void ShowMainWindow();
void StartBackend();
void StopBackend();
void OpenBrowser();
LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

// Entry point
int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPWSTR lpCmdLine, int nCmdShow) {
    // Initialize paths
    if (!InitializePaths()) {
        MessageBoxW(NULL, L"Failed to initialize application paths", L"Error", MB_OK | MB_ICONERROR);
        return 1;
    }
    
    // Check if first run
    Json::Value config;
    BOOL needsSetup = TRUE;
    
    if (LoadConfig(config)) {
        std::string apiKey = config.get("moonshotApiKey", "").asString();
        if (!apiKey.empty()) {
            needsSetup = FALSE;
        }
    }
    
    // Register window class
    WNDCLASSEXW wc = {0};
    wc.cbSize = sizeof(WNDCLASSEXW);
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = CLASS_NAME;
    wc.hIcon = LoadIconW(hInstance, MAKEINTRESOURCEW(IDI_APP_ICON));
    wc.hIconSm = LoadIconW(hInstance, MAKEINTRESOURCEW(IDI_APP_ICON));
    wc.hCursor = LoadCursorW(NULL, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    
    if (!RegisterClassExW(&wc)) {
        return 1;
    }
    
    // Create main window
    g_hwnd = CreateWindowExW(
        0,
        CLASS_NAME,
        WINDOW_TITLE,
        WS_OVERLAPPEDWINDOW & ~WS_MAXIMIZEBOX & ~WS_THICKFRAME,
        CW_USEDEFAULT, CW_USEDEFAULT,
        500, 400,
        NULL,
        NULL,
        hInstance,
        NULL
    );
    
    if (!g_hwnd) {
        return 1;
    }
    
    // Show appropriate view
    if (needsSetup) {
        ShowSetupDialog();
    } else {
        ShowMainWindow();
        StartBackend();
    }
    
    ShowWindow(g_hwnd, nCmdShow);
    UpdateWindow(g_hwnd);
    
    // Message loop
    MSG msg;
    while (GetMessageW(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }
    
    // Cleanup
    StopBackend();
    
    return (int)msg.wParam;
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_CREATE: {
            // Create controls
            HFONT hFont = CreateFontW(16, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
                DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
                DEFAULT_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Segoe UI");
            
            // Status label
            g_status = CreateWindowW(L"STATIC", L"",
                WS_VISIBLE | WS_CHILD | SS_CENTER,
                20, 20, 440, 60,
                hwnd, NULL, NULL, NULL);
            SendMessageW(g_status, WM_SETFONT, (WPARAM)hFont, TRUE);
            
            // API Key input
            g_apiKeyInput = CreateWindowW(L"EDIT", L"",
                WS_VISIBLE | WS_CHILD | WS_BORDER | ES_PASSWORD,
                20, 100, 360, 30,
                hwnd, NULL, NULL, NULL);
            SendMessageW(g_apiKeyInput, WM_SETFONT, (WPARAM)hFont, TRUE);
            
            // Save button
            g_saveBtn = CreateWindowW(L"BUTTON", L"Save & Start",
                WS_VISIBLE | WS_CHILD | BS_DEFPUSHBUTTON,
                390, 100, 90, 30,
                hwnd, (HMENU)1, NULL, NULL);
            SendMessageW(g_saveBtn, WM_SETFONT, (WPARAM)hFont, TRUE);
            
            // Progress bar
            g_progress = CreateWindowW(PROGRESS_CLASSW, NULL,
                WS_VISIBLE | WS_CHILD | PBS_SMOOTH,
                20, 160, 440, 20,
                hwnd, NULL, NULL, NULL);
            
            // Help text
            CreateWindowW(L"STATIC",
                L"Get your API key at: platform.moonshot.cn",
                WS_VISIBLE | WS_CHILD | SS_CENTER,
                20, 200, 440, 20,
                hwnd, NULL, NULL, NULL);
            
            DeleteObject(hFont);
            return 0;
        }
        
        case WM_COMMAND:
            if (LOWORD(wParam) == 1) { // Save button
                wchar_t apiKey[256];
                GetWindowTextW(g_apiKeyInput, apiKey, 256);
                
                if (wcslen(apiKey) == 0) {
                    MessageBoxW(hwnd, L"Please enter your API key", L"Error", MB_OK | MB_ICONWARNING);
                    return 0;
                }
                
                // Save config
                Json::Value config;
                config["moonshotApiKey"] = std::wstring_to_utf8(apiKey);
                config["githubToken"] = "";
                config["firstRun"] = false;
                SaveConfig(config);
                
                // Hide setup controls
                ShowWindow(g_apiKeyInput, SW_HIDE);
                ShowWindow(g_saveBtn, SW_HIDE);
                
                // Show main window and start backend
                ShowMainWindow();
                StartBackend();
            }
            return 0;
        
        case WM_DESTROY:
            StopBackend();
            PostQuitMessage(0);
            return 0;
    }
    
    return DefWindowProcW(hwnd, uMsg, wParam, lParam);
}

BOOL InitializePaths() {
    wchar_t path[MAX_PATH];
    GetModuleFileNameW(NULL, path, MAX_PATH);
    
    // Get directory
    wchar_t* lastSlash = wcsrchr(path, L'\\');
    if (lastSlash) {
        *lastSlash = L'\0';
    }
    
    g_appDir = path;
    g_backendPath = g_appDir + L"\\backend\\dist\\index.js";
    g_configPath = g_appDir + L"\\config.json";
    
    // Find Node.js
    g_nodePath = g_appDir + L"\\node\\node.exe";
    if (GetFileAttributesW(g_nodePath.c_str()) == INVALID_FILE_ATTRIBUTES) {
        // Try system Node.js
        g_nodePath = L"node.exe";
    }
    
    return TRUE;
}

BOOL LoadConfig(Json::Value& config) {
    std::ifstream file(g_configPath);
    if (!file.is_open()) {
        return FALSE;
    }
    
    Json::CharReaderBuilder builder;
    std::string errors;
    
    if (!Json::parseFromStream(builder, file, &config, &errors)) {
        return FALSE;
    }
    
    return TRUE;
}

BOOL SaveConfig(const Json::Value& config) {
    std::ofstream file(g_configPath);
    if (!file.is_open()) {
        return FALSE;
    }
    
    Json::StreamWriterBuilder builder;
    builder["indentation"] = "  ";
    std::unique_ptr<Json::StreamWriter> writer(builder.newStreamWriter());
    writer->write(config, &file);
    
    return TRUE;
}

void ShowSetupDialog() {
    SetWindowTextW(g_status, L"Welcome to EpiGrader!\n\nPlease enter your Moonshot API key to continue.");
    ShowWindow(g_apiKeyInput, SW_SHOW);
    ShowWindow(g_saveBtn, SW_SHOW);
    ShowWindow(g_progress, SW_HIDE);
}

void ShowMainWindow() {
    SetWindowTextW(g_status, L"Starting EpiGrader server...\nPlease wait...");
    ShowWindow(g_apiKeyInput, SW_HIDE);
    ShowWindow(g_saveBtn, SW_HIDE);
    ShowWindow(g_progress, SW_SHOW);
    SendMessageW(g_progress, PBM_SETRANGE, 0, MAKELPARAM(0, 100));
    SendMessageW(g_progress, PBM_SETPOS, 0, 0);
}

void StartBackend() {
    // Load config
    Json::Value config;
    if (!LoadConfig(config)) {
        MessageBoxW(g_hwnd, L"Failed to load configuration", L"Error", MB_OK | MB_ICONERROR);
        return;
    }
    
    // Create .env file
    std::wstring envPath = g_appDir + L"\\backend\\.env";
    std::ofstream envFile(envPath);
    if (envFile.is_open()) {
        envFile << "NODE_ENV=production\n";
        envFile << "PORT=0\n";
        envFile << "MOONSHOT_API_KEY=" << config["moonshotApiKey"].asString() << "\n";
        envFile.close();
    }
    
    // Start backend process
    STARTUPINFOW si = {0};
    si.cb = sizeof(si);
    si.dwFlags = STARTF_USESHOWWINDOW;
    si.wShowWindow = SW_HIDE;
    
    PROCESS_INFORMATION pi = {0};
    
    std::wstring cmdLine = L"\"" + g_nodePath + L"\" \"" + g_backendPath + L"\"";
    
    if (CreateProcessW(NULL, &cmdLine[0], NULL, NULL, FALSE,
        CREATE_NO_WINDOW | DETACHED_PROCESS,
        NULL, g_appDir.c_str(), &si, &pi)) {
        
        g_backendProcess = pi.hProcess;
        CloseHandle(pi.hThread);
        
        // Animate progress
        for (int i = 0; i <= 100; i += 2) {
            SendMessageW(g_progress, PBM_SETPOS, i, 0);
            Sleep(50);
        }
        
        // Open browser
        OpenBrowser();
        
        SetWindowTextW(g_status, L"EpiGrader is running!\nBrowser should open automatically.");
    } else {
        MessageBoxW(g_hwnd, L"Failed to start backend server", L"Error", MB_OK | MB_ICONERROR);
    }
}

void StopBackend() {
    if (g_backendProcess) {
        TerminateProcess(g_backendProcess, 0);
        CloseHandle(g_backendProcess);
        g_backendProcess = NULL;
    }
}

void OpenBrowser() {
    // Read port from file
    std::wstring portFile = g_appDir + L"\\backend\\.port";
    std::ifstream file(portFile);
    std::string port = "3002";
    
    if (file.is_open()) {
        std::getline(file, port);
        file.close();
    }
    
    std::wstring url = L"http://localhost:" + std::wstring(port.begin(), port.end());
    ShellExecuteW(NULL, L"open", url.c_str(), NULL, NULL, SW_SHOWNORMAL);
}