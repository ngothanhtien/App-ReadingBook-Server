const confirmVerifyEmailTemplate = (email,_id,uniqueString, CurrentUrl) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email address</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: #dddddd ;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .logo-container{
                display: flex;
                gap: 10px;
                align-items: center;

                margin-bottom: 20px;
            }
            .logo-book {
                width: 60px;
                height: 60px;
                margin-right: 10px;
            }
            .logo-title {
                font-size: 30px;
                font-weight: bold;
                color: #000;
                margin-top: 10px;
            }
            .email-container {
                background: #fff7be;
                border-radius: 16px;
                padding: 60px 40px;
                max-width: 500px;
                width: 100%;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            .icon-container {
                margin-bottom: 30px;
                position: relative;
            }
            
            .email-icon {
                width: 80px;
                height: 80px;
                background: #fff;
                border-radius: 12px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                position: relative;
                margin-bottom: 10px;
            }       
            
            h1 {
                font-size: 28px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 20px;
                line-height: 1.3;
            }
            
            .email-text {
                font-size: 16px;
                color: #5a6c7d;
                margin-bottom: 8px;
                line-height: 1.5;
            }
            
            .email-address {
                font-weight: 600;
                color: #2c3e50;
            }
            
            .instruction-text {
                font-size: 16px;
                color: #5a6c7d;
                margin-bottom: 40px;
                line-height: 1.5;
            }
            
            .verify-button {
                background: #e19315;
                color: white;
                padding: 16px 40px;
                border: none;
                border-radius: 8px;
                font-size: 18px;
                font-weight: 700;
                text-decoration: none;
                display: inline-block;
                margin-bottom: 30px;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                cursor: pointer;
            }
            
            .verify-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
            }
            
            .alternative-text {
                font-size: 15px;
                color: #7f8c8d;
                margin-bottom: 10px;
            }
            
            .link-text {
                font-size: 15px;
                color: #667eea;
                word-break: break-all;
                background: #f8f9fa;
                padding: 10px;
                border-radius: 6px;
                border: 1px solid #e9ecef;
            }
            
            .expiry-text {
                font-size: 15px;
                color: #95a5a6;
                margin-top: 20px;
                font-style: italic;
            }
            
            @media (max-width: 480px) {
                .email-container {
                    padding: 40px 20px;
                }
                
                h1 {
                    font-size: 24px;
                }
                
                .verify-button {
                    padding: 14px 30px;
                    font-size: 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="logo-container">
                <img src="https://cdn-icons-png.flaticon.com/512/171/171322.png" alt="ReadingCorner Logo" class="logo-book" />
                <h2 class="logo-title">ReadingCorner</h2>
            </div>
            <div class="icon-container">
                <div class="email-icon">
                    <img src="https://img.freepik.com/premium-vector/email-vector-illustration-white-background_917213-247178.jpg?semt=ais_hybrid&w=740" alt="Email Icon" style="width: 60px; height: 60px;">
                </div>
            </div>
            
            <h1 style="margin-bottom: 20px;font-weight: 700;color: #535252;">Verify your email address</h1>
            
            <p class="email-text">
                You've entered <span class="email-address">${email}</span> as the email address for your account.
            </p>
            
            <p class="instruction-text">
                Please verify this email address by clicking button below.
            </p>
            
            <a href="${CurrentUrl}api/users/verify/${_id}/${uniqueString}" class="verify-button">
                Verify Email
            </a>
            
            <p class="alternative-text">Or copy and paste this link into your browser:</p>
            
            <div class="link-text">
                ${CurrentUrl}api/users/verify/${_id}/${uniqueString}
            </div>
            
            <p class="expiry-text">This link will expire in 30 minutes</p>
        </div>
    </body>
</html>
    `;
};
module.exports = confirmVerifyEmailTemplate;