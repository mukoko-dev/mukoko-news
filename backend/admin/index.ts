export function getAdminHTML(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mukoko News API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --zw-green: #00A651;
            --zw-yellow: #FDD116;
            --zw-red: #EF3340;
            --zw-black: #000000;
            --zw-white: #FFFFFF;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            min-height: 100vh;
            color: #e8e8e8;
            padding: 40px 20px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 60px;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo {
            font-size: 48px;
            font-weight: 700;
            background: linear-gradient(135deg, var(--zw-green) 0%, var(--zw-yellow) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 12px;
        }

        .tagline {
            font-size: 18px;
            color: #9ca3af;
            margin-bottom: 8px;
        }

        .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(0, 166, 81, 0.1);
            border: 1px solid var(--zw-green);
            border-radius: 20px;
            color: var(--zw-green);
            font-size: 14px;
            font-weight: 600;
            margin-top: 20px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: var(--zw-green);
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .section {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .section-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 24px;
            color: #ffffff;
        }

        .endpoint {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
        }

        .endpoint:hover {
            border-color: var(--zw-green);
            transform: translateY(-2px);
        }

        .endpoint-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }

        .method {
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .method.get {
            background: rgba(0, 166, 81, 0.2);
            color: var(--zw-green);
        }

        .method.post {
            background: rgba(253, 209, 22, 0.2);
            color: var(--zw-yellow);
        }

        .path {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #60a5fa;
        }

        .description {
            color: #9ca3af;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 12px;
        }

        .try-it {
            display: inline-block;
            padding: 8px 16px;
            background: var(--zw-green);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .try-it:hover {
            background: #008f45;
            transform: translateY(-1px);
        }

        .footer {
            text-align: center;
            margin-top: 60px;
            padding: 24px;
            color: #6b7280;
            font-size: 14px;
        }

        .footer a {
            color: var(--zw-green);
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        /* AI Testing Styles */
        .ai-test-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: 600;
        }

        .ai-status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #9ca3af;
        }

        .ai-status-indicator.running {
            background: var(--zw-yellow);
            animation: pulse 1s ease-in-out infinite;
        }

        .ai-status-indicator.passed {
            background: var(--zw-green);
        }

        .ai-status-indicator.failed {
            background: var(--zw-red);
        }

        .ai-tests-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
        }

        .ai-test-item {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ai-test-item.passed {
            border-color: rgba(0, 166, 81, 0.3);
        }

        .ai-test-item.failed {
            border-color: rgba(239, 51, 64, 0.3);
        }

        .ai-test-item.skipped {
            border-color: rgba(253, 209, 22, 0.3);
            opacity: 0.7;
        }

        .ai-test-name {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .ai-test-badge {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .ai-test-badge.passed {
            background: rgba(0, 166, 81, 0.2);
            color: var(--zw-green);
        }

        .ai-test-badge.failed {
            background: rgba(239, 51, 64, 0.2);
            color: var(--zw-red);
        }

        .ai-test-badge.skipped {
            background: rgba(253, 209, 22, 0.2);
            color: var(--zw-yellow);
        }

        .ai-test-duration {
            font-size: 12px;
            color: #6b7280;
            margin-left: auto;
        }

        .ai-test-result {
            font-size: 13px;
            color: #9ca3af;
            margin-top: 8px;
            font-family: 'Courier New', monospace;
            background: rgba(0, 0, 0, 0.2);
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-all;
        }

        .ai-test-error {
            color: var(--zw-red);
        }

        .ai-test-summary {
            display: flex;
            gap: 24px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            justify-content: center;
        }

        .ai-summary-item {
            text-align: center;
        }

        .ai-summary-value {
            font-size: 24px;
            font-weight: 700;
        }

        .ai-summary-value.passed { color: var(--zw-green); }
        .ai-summary-value.failed { color: var(--zw-red); }
        .ai-summary-value.skipped { color: var(--zw-yellow); }

        .ai-summary-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Mukoko News API</div>
            <div class="tagline">Zimbabwe's Modern News Platform Backend</div>
            <div class="status">
                <span class="status-dot"></span>
                All Systems Operational
            </div>
        </div>

        <div class="section">
            <div class="section-title">📰 News & Articles</div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/feeds</span>
                </div>
                <div class="description">
                    Get paginated news feed. Supports filtering by category.
                    <br>Query params: limit, offset, category
                </div>
                <a href="/api/feeds?limit=5" class="try-it" target="_blank">Try it →</a>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/categories</span>
                </div>
                <div class="description">
                    Get all available news categories (Politics, Economy, Sports, etc.)
                </div>
                <a href="/api/categories" class="try-it" target="_blank">Try it →</a>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/article/by-source-slug</span>
                </div>
                <div class="description">
                    Get single article by source and slug.
                    <br>Query params: source, slug
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">💚 User Engagement</div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/articles/:id/like</span>
                </div>
                <div class="description">
                    Like or unlike an article (requires authentication)
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/articles/:id/save</span>
                </div>
                <div class="description">
                    Bookmark or unbookmark an article (requires authentication)
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/articles/:id/view</span>
                </div>
                <div class="description">
                    Track article view for analytics
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/articles/:id/comments</span>
                </div>
                <div class="description">
                    Get comments for an article
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/articles/:id/comment</span>
                </div>
                <div class="description">
                    Add a comment to an article (requires authentication)
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">🔐 Authentication</div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/auth/login</span>
                </div>
                <div class="description">
                    Login with email and password. Returns session token.
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/auth/register</span>
                </div>
                <div class="description">
                    Register new user account. Creates session automatically.
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/auth/logout</span>
                </div>
                <div class="description">
                    Logout and invalidate session token.
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/auth/session</span>
                </div>
                <div class="description">
                    Get current session and user info.
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">👤 User Profile</div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/user/me/preferences</span>
                </div>
                <div class="description">
                    Get user preferences and settings (requires authentication)
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/user/me/preferences</span>
                </div>
                <div class="description">
                    Update user preferences (requires authentication)
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/user/me/follows</span>
                </div>
                <div class="description">
                    Follow a news source or journalist (requires authentication)
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/health</span>
                </div>
                <div class="description">
                    Health check endpoint. Returns service status.
                </div>
                <a href="/api/health" class="try-it" target="_blank">Try it →</a>
            </div>
        </div>

        <div class="section">
            <div class="section-title">🤖 AI Testing</div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/admin/ai-test</span>
                </div>
                <div class="description">
                    Run AI functionality tests. Tests: AI binding, inference, content cleaning, keyword extraction, and quality scoring.
                </div>
                <button id="runAiTests" class="try-it" onclick="runAITests()">Run AI Tests →</button>
            </div>

            <div id="aiTestResults" style="display: none; margin-top: 20px;">
                <div class="ai-test-header">
                    <span id="aiStatusIndicator" class="ai-status-indicator"></span>
                    <span id="aiStatusText">Running tests...</span>
                </div>
                <div id="aiTestsList" class="ai-tests-list"></div>
                <div id="aiTestSummary" class="ai-test-summary"></div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/admin/ai-pipeline-status</span>
                </div>
                <div class="description">
                    View AI processing statistics, author recognition, and keyword extraction metrics.
                </div>
                <a href="/api/admin/ai-pipeline-status" class="try-it" target="_blank">View Status →</a>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/admin/content-quality</span>
                </div>
                <div class="description">
                    View content quality distribution and AI enhancement statistics.
                </div>
                <a href="/api/admin/content-quality" class="try-it" target="_blank">View Quality →</a>
            </div>
        </div>

        <div class="footer">
            <p>Mukoko News Backend API • Powered by Cloudflare Workers</p>
            <p>
                <a href="https://news.mukoko.com" target="_blank">Visit News Site</a>
            </p>
        </div>
    </div>

    <script>
        // Escape HTML to prevent XSS
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        async function runAITests() {
            const resultsDiv = document.getElementById('aiTestResults');
            const statusIndicator = document.getElementById('aiStatusIndicator');
            const statusText = document.getElementById('aiStatusText');
            const testsList = document.getElementById('aiTestsList');
            const summaryDiv = document.getElementById('aiTestSummary');
            const runButton = document.getElementById('runAiTests');

            // Show loading state
            resultsDiv.style.display = 'block';
            statusIndicator.className = 'ai-status-indicator running';
            statusText.textContent = 'Running AI tests...';
            testsList.innerHTML = '';
            summaryDiv.innerHTML = '';
            runButton.disabled = true;
            runButton.textContent = 'Running...';

            try {
                const response = await fetch('/api/admin/ai-test', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                // Update status
                const allPassed = data.summary.failed === 0 && data.summary.passed > 0;
                statusIndicator.className = 'ai-status-indicator ' + (allPassed ? 'passed' : 'failed');
                statusText.textContent = allPassed ? 'All tests passed!' : \`\${data.summary.failed} test(s) failed\`;

                // Render each test
                data.tests.forEach(test => {
                    const testItem = document.createElement('div');
                    testItem.className = 'ai-test-item ' + test.status;

                    let resultHtml = '';
                    if (test.result) {
                        resultHtml = '<div class="ai-test-result">' + escapeHtml(JSON.stringify(test.result, null, 2)) + '</div>';
                    }
                    if (test.error) {
                        resultHtml = '<div class="ai-test-result ai-test-error">Error: ' + escapeHtml(String(test.error)) + '</div>';
                    }

                    testItem.innerHTML = \`
                        <div class="ai-test-name">
                            <span>\${escapeHtml(String(test.name))}</span>
                            <span class="ai-test-badge \${escapeHtml(String(test.status))}">\${escapeHtml(String(test.status))}</span>
                            <span class="ai-test-duration">\${escapeHtml(String(test.duration_ms))}ms</span>
                        </div>
                        \${resultHtml}
                    \`;

                    testsList.appendChild(testItem);
                });

                // Render summary (numeric values escaped for safety)
                summaryDiv.innerHTML = \`
                    <div class="ai-summary-item">
                        <div class="ai-summary-value">\${escapeHtml(String(data.summary.total))}</div>
                        <div class="ai-summary-label">Total</div>
                    </div>
                    <div class="ai-summary-item">
                        <div class="ai-summary-value passed">\${escapeHtml(String(data.summary.passed))}</div>
                        <div class="ai-summary-label">Passed</div>
                    </div>
                    <div class="ai-summary-item">
                        <div class="ai-summary-value failed">\${escapeHtml(String(data.summary.failed))}</div>
                        <div class="ai-summary-label">Failed</div>
                    </div>
                    <div class="ai-summary-item">
                        <div class="ai-summary-value skipped">\${escapeHtml(String(data.summary.skipped))}</div>
                        <div class="ai-summary-label">Skipped</div>
                    </div>
                \`;

            } catch (error) {
                statusIndicator.className = 'ai-status-indicator failed';
                statusText.textContent = 'Test run failed';
                testsList.innerHTML = '<div class="ai-test-result ai-test-error">Error: ' + escapeHtml(String(error.message)) + '</div>';
            } finally {
                runButton.disabled = false;
                runButton.textContent = 'Run AI Tests →';
            }
        }
    </script>
</body>
</html>
`;
}

export function getLoginHTML(): string {
  return getAdminHTML(); // Same simple UI
}
