const form =
    document.getElementById("login-form");


const message =
    document.getElementById("login-message");


const button =
    document.getElementById("login-button");


form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("email").value.trim();


        const senha =
            document.getElementById("senha").value;


        message.textContent =
            "Entrando...";


        message.className =
            "login-message";


        button.disabled = true;


        try {

            const response =
                await fetch(
                    "/api/login",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            senha
                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.mensagem ||
                    "E-mail ou senha inválidos."
                );

            }


            message.textContent =
                "Login realizado!";


            message.className =
                "login-message success";


            window.location.href =
                "/admin.html";


        } catch (error) {

            console.error(error);


            message.textContent =
                error.message;


            message.className =
                "login-message error";


            button.disabled = false;

        }

    }
);