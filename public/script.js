const ID_GOOGLE = "308036544937-p2vnblmnvuo7g30aoau7f6udhjmmao1u.apps.googleusercontent.com";

const form = document.querySelector("#formulario");
const entrada = document.querySelector("#numero");
const desenho = document.querySelector("#desenho");
const aviso = document.querySelector("#mensagem");
const download = document.querySelector("#baixar");

let tokenGoogle = "";
let conteudoSvg = "";

if (window.google) {
    google.accounts.id.initialize({
        client_id: ID_GOOGLE,

        callback: (resultado) => {
            tokenGoogle = resultado.credential;
            aviso.textContent = "Login realizado com sucesso.";
        }
    });

    google.accounts.id.renderButton(
        document.querySelector("#g_id_signin"),
        {
            theme: "outline",
            size: "large"
        }
    );
} else {
    console.error("Biblioteca Google não carregada.");
}

function mostrarErro(mensagem) {
    aviso.textContent = mensagem;
}

form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    aviso.textContent = "";
    desenho.innerHTML = "";

    const valor = Number(entrada.value);

    const configuracao = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            numero: valor
        })
    };

    if (tokenGoogle) {
        configuracao.headers.Authorization = `Bearer ${tokenGoogle}`;
    }

    try {
        const retorno = await fetch("/api/desenho", configuracao);

        if (retorno.status === 400) {
            mostrarErro("Número inválido: use um inteiro de 1 a 100.");
            return;
        }

        if (retorno.status === 401) {
            tokenGoogle = "";
            mostrarErro("Faça login com o Google.");
            return;
        }

        if (!retorno.ok) {
            mostrarErro(`Erro ${retorno.status}`);
            return;
        }

        conteudoSvg = await retorno.text();

        desenho.innerHTML = conteudoSvg;
        download.hidden = false;

    } catch (erro) {
        console.error(erro);
        mostrarErro("Falha ao conectar com o servidor.");
    }
});

download?.addEventListener("click", () => {
    const blob = new Blob(
        [conteudoSvg],
        { type: "image/svg+xml" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "desenho.svg";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
});
