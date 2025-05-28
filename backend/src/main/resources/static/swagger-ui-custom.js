window.onload = function() {
    // Get the context path from the URL
    const contextPath = window.location.pathname.split('/swagger-ui')[0];
    
    window.ui = SwaggerUIBundle({
        url: contextPath + "/api-docs",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        requestInterceptor: function(request) {
            const token = localStorage.getItem("jwt_token");
            if (token) {
                request.headers.Authorization = "Bearer " + token;
            }
            return request;
        }
    });

    // Add JWT token input field
    const tokenInput = document.createElement('div');
    tokenInput.innerHTML = `
        <div class="swagger-ui">
            <div class="wrapper" style="padding: 10px 20px; background: #f0f0f0; margin-bottom: 20px;">
                <h3 style="margin: 10px 0;">JWT Authentication</h3>
                <div style="display: flex; align-items: center;">
                    <input id="jwt_token" type="text" placeholder="Enter JWT token" style="padding: 6px; width: 50%; margin-right: 10px;">
                    <button id="set_token" style="padding: 6px 12px; background: #4990e2; color: white; border: none; cursor: pointer;">Set Token</button>
                    <button id="clear_token" style="padding: 6px 12px; margin-left: 10px; background: #f44336; color: white; border: none; cursor: pointer;">Clear Token</button>
                </div>
                <p style="margin-top: 10px; font-size: 12px;">
                    1. Login using the /auth/login endpoint<br>
                    2. Copy the token from the response<br>
                    3. Paste the token here and click "Set Token"<br>
                    4. Now you can use the authenticated endpoints
                </p>
            </div>
        </div>
    `;
    
    const swaggerUi = document.getElementById('swagger-ui');
    swaggerUi.parentNode.insertBefore(tokenInput, swaggerUi);

    // Add event listeners
    document.getElementById('set_token').addEventListener('click', function() {
        const token = document.getElementById('jwt_token').value;
        if (token) {
            localStorage.setItem("jwt_token", token);
            alert("Token set successfully!");
            window.ui.preauthorizeApiKey("Bearer Authentication", token);
        }
    });

    document.getElementById('clear_token').addEventListener('click', function() {
        localStorage.removeItem("jwt_token");
        document.getElementById('jwt_token').value = '';
        alert("Token cleared!");
    });

    // Load token from localStorage if exists
    const savedToken = localStorage.getItem("jwt_token");
    if (savedToken) {
        document.getElementById('jwt_token').value = savedToken;
        window.ui.preauthorizeApiKey("Bearer Authentication", savedToken);
    }
}; 