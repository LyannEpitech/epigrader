╔════════════════════════════════════════════════════════════════╗
║                    EpiGrader v1.0.0                            ║
║              AI-Powered Code Grading Tool                      ║
╚════════════════════════════════════════════════════════════════╝

QUICK START
───────────

1. Prerequisites:
   • Node.js 18 or higher installed
   • GitHub Personal Access Token (PAT)
   • Moonshot API key (for AI analysis)

2. First Run:
   
   Linux/Mac:
     ./start.sh
   
   Windows:
     Double-click start.bat

3. The application will:
   ✓ Start the backend server on http://localhost:3002
   ✓ Open your default browser automatically
   ✓ Display the EpiGrader interface

CONFIGURATION
─────────────

Edit package/.env file:

  MOONSHOT_API_KEY=your_moonshot_api_key_here

Get your API key from: https://platform.moonshot.cn/

GITHUB TOKEN
────────────

1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes:
   ☑ repo (Full control of private repositories)
4. For Epitech repositories:
   → Authorize SAML SSO at:
     https://github.com/orgs/EpitechBachelorPromo2028/sso

USAGE
─────

1. Enter your GitHub PAT in the interface
2. Create or select a grading rubric
3. Paste a GitHub repository URL
4. Click "Analyze"
5. Wait for AI analysis to complete
6. Review the detailed grading report
7. Export as PDF if needed

TROUBLESHOOTING
───────────────

❌ "Port 3002 is already in use"
   → Kill existing Node processes:
      Linux/Mac: killall node
      Windows: taskkill /F /IM node.exe

❌ "Cannot connect to backend"
   → Check that the server started correctly
   → Look for error messages in the terminal

❌ "GitHub API error"
   → Verify your PAT is valid
   → Check SAML SSO authorization for Epitech repos

❌ "Moonshot API error"
   → Verify your API key in package/.env
   → Check your Moonshot account has available credits

SUPPORT
───────

GitHub: https://github.com/LyannEpitech/epigrader
Issues: https://github.com/LyannEpitech/epigrader/issues

LICENSE
───────

MIT License - See LICENSE file for details

═══════════════════════════════════════════════════════════════════
