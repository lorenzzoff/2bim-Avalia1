import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Método não permitido", {
      status: 405,
    });
  }

}

  try {
    let corpo;

    try {
      corpo = await context.request.json();
    } catch {
      return new Response(null, {
        status: 400,
      });
    }

    const numero = Number(corpo.numero);

    if (!numeroValido(numero)) {
      return new Response(null, {
        status: 400,
      });
    }

    const authorization =
      context.request.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return new Response(null, {
        status: 401,
      });
    }

    const token = authorization.substring(7);

    const respostaGoogle = await fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" +
      encodeURIComponent(token)
    );

    if (!respostaGoogle.ok) {
      return new Response(null, {
        status: 401,
      });
    }

    const dados = await respostaGoogle.json();

    if (
      dados.aud !== context.env.GOOGLE_CLIENT_ID ||
      dados.email_verified !== "true"
    ) {
      return new Response(null, {
        status: 401,
      });
    }

    const svg = gerarDesenho(
      numero,
      dados.email
    );

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
      },
    });

  } catch {
    return new Response("Erro interno", {
      status: 500,
    });
  }
}
