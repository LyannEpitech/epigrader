# Analysis Debug Report

## Test Results

### Repo: microsoft/vscode (Public)
- **Total files**: 13,270
- **Code files detected**: 8,607
- **Sample files found**:
  - AGENTS.md, CONTRIBUTING.md, README.md
  - cli/.cargo/config.toml, cli/Cargo.toml
  - cli/src/async_pipe.rs, cli/src/auth.rs
  - cli/src/commands.rs, cli/src/commands/agent_host.rs
  - cli/src/commands/args.rs, cli/src/commands/context.rs

### File Extensions Supported
The analyzer now scans 50+ file types including:
- **C/C++**: .c, .h, .cpp, .cc, .cxx, .hpp
- **Python**: .py, .pyc, .pyo
- **JavaScript/TypeScript**: .js, .jsx, .ts, .tsx, .mjs
- **Java**: .java, .class, .jar
- **Go**: .go, .mod, .sum
- **Rust**: .rs, .toml
- **Ruby**: .rb, .erb
- **PHP**: .php, .phtml
- **Swift**: .swift
- **Kotlin**: .kt, .kts
- **Scala**: .scala, .sc
- **C#**: .cs, .csproj
- **Shell**: .sh, .bash, .zsh, .fish
- **Web**: .html, .htm, .css, .scss, .sass, .less
- **Data**: .json, .yaml, .yml, .xml, .toml
- **Docs**: .md, .markdown, .rst
- **Config**: Makefile, Dockerfile, .gitignore, .env.example
- **Build**: CMakeLists.txt, Cargo.toml, package.json, requirements.txt, pom.xml, build.gradle

### Directory Structure
Files are now grouped by directory in the LLM prompt:
```
## Root Directory:
--- README.md ---
--- Makefile ---

## Directory: src/
--- src/main.c ---
--- src/utils.c ---

## Directory: include/
--- include/header.h ---
```

### Exclusions
The following are automatically excluded:
- node_modules/, vendor/, __pycache__/
- .git/, dist/, build/, target/
- bin/, obj/
- Hidden files (starting with .)

## Epitech Repos
Epitech repos (EpitechBachelorPromo2028/*) require SAML SSO authentication. The current GitHub token needs to be authorized for the Epitech organization.

To access Epitech repos:
1. Visit: https://github.com/orgs/EpitechBachelorPromo2028/sso
2. Authorize your Personal Access Token
3. Or use a token already authorized for SAML SSO

## Recommendations

1. **For Epitech repos**: Authorize the GitHub PAT for SAML SSO
2. **Analysis depth**: Currently limited to 50 files - consider increasing for large projects
3. **File prioritization**: Important files (README, Makefile, main.*) are analyzed first
4. **Cache**: Analysis results are cached for 24 hours to avoid re-analyzing same repos