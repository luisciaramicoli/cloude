from flask import Flask, request, jsonify, render_template_string
import json
import os

app = Flask(__name__)
DATA_FILE = "dados.json"

TEMPLATE_HTML = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro e Listagem</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0f172a;
            --glass-bg: rgba(30, 41, 59, 0.7);
            --glass-border: rgba(255, 255, 255, 0.1);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent-color: #3b82f6;
            --accent-hover: #2563eb;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            color: var(--text-primary);
            min-height: 100vh;
            margin: 0;
            padding: 3rem 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .container {
            width: 100%;
            max-width: 800px;
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .glass-panel {
            background: var(--glass-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        h1, h2 {
            font-weight: 800;
            margin-top: 0;
            margin-bottom: 1.5rem;
            background: linear-gradient(to right, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .form-group {
            margin-bottom: 1.2rem;
            display: flex;
            flex-direction: column;
        }

        label {
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
        }

        input {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid var(--glass-border);
            color: var(--text-primary);
            padding: 0.8rem 1rem;
            border-radius: 8px;
            font-family: inherit;
            font-size: 1rem;
            transition: border-color 0.3s;
        }

        input:focus {
            outline: none;
            border-color: var(--accent-color);
        }

        button {
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s, transform 0.1s;
            width: 100%;
            margin-top: 1rem;
        }

        button:hover {
            background: var(--accent-hover);
            transform: translateY(-2px);
        }

        .data-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .data-item {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: transform 0.3s, background 0.3s;
        }

        .data-item:hover {
            transform: translateX(5px);
            background: rgba(255, 255, 255, 0.05);
        }

        .item-info {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
        }

        .item-name {
            font-size: 1.2rem;
            font-weight: 600;
        }

        .item-phone {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        .item-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: #10b981;
        }

        .empty-state {
            text-align: center;
            color: var(--text-secondary);
            padding: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="glass-panel">
            <h1>Cadastrar Novo Registro</h1>
            <form action="/" method="POST">
                <div class="form-group">
                    <label for="nome">Nome Completo</label>
                    <input type="text" id="nome" name="nome" placeholder="Ex: João da Silva" required>
                </div>
                <div class="form-group">
                    <label for="telefone">Telefone</label>
                    <input type="text" id="telefone" name="telefone" placeholder="Ex: (11) 99999-9999" required>
                </div>
                <div class="form-group">
                    <label for="valor">Valor (R$)</label>
                    <input type="number" id="valor" name="valor" step="0.01" placeholder="Ex: 150.50" required>
                </div>
                <button type="submit">Cadastrar</button>
            </form>
        </div>

        <div class="glass-panel" style="animation-delay: 0.2s;">
            <h2>Lista de Registros</h2>
            {% if registros %}
            <ul class="data-list">
                {% for r in registros %}
                {% if r is mapping %}
                <li class="data-item">
                    <div class="item-info">
                        <span class="item-name">{{ r.nome }}</span>
                        <span class="item-phone">📞 {{ r.telefone }}</span>
                    </div>
                    <div class="item-value">
                        R$ {{ "%.2f"|format(r.valor) }}
                    </div>
                </li>
                {% endif %}
                {% endfor %}
            </ul>
            {% else %}
            <div class="empty-state">
                <p>Nenhum registro encontrado.</p>
            </div>
            {% endif %}
        </div>
    </div>
</body>
</html>
"""


def carregar_dados():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def salvar_dados(dados):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=4, ensure_ascii=False)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        nome = request.form.get("nome")
        telefone = request.form.get("telefone")
        valor = request.form.get("valor")
        
        if nome and telefone and valor:
            try:
                valor_float = float(valor)
                novo_registro = {"nome": nome, "telefone": telefone, "valor": valor_float}
                dados = carregar_dados()
                dados.append(novo_registro)
                salvar_dados(dados)
            except ValueError:
                pass
                
    dados = carregar_dados()
    return render_template_string(TEMPLATE_HTML, registros=dados)


@app.route("/api/registro", methods=["POST"])
def criar_registro():
    conteudo = request.get_json()

    if not conteudo:
        return jsonify(
            {"erro": "O corpo da requisição precisa ser um JSON válido."}
        ), 400

    nome = conteudo.get("nome")
    telefone = conteudo.get("telefone")
    valor = conteudo.get("valor")

    if not nome or not telefone or valor is None:
        return jsonify(
            {"erro": "Os campos 'nome', 'telefone' e 'valor' são obrigatórios."}
        ), 400

    novo_registro = {"nome": nome, "telefone": telefone, "valor": valor}

    dados = carregar_dados()
    dados.append(novo_registro)
    salvar_dados(dados)

    return jsonify(
        {"mensagem": "Registro gravado com sucesso!", "registro": novo_registro}
    ), 201


@app.route("/api/registros", methods=["GET"])
def listar_registros():
    dados = carregar_dados()
    dados.append("Endereco")
    return jsonify(dados), 200


if __name__ == "__main__":
    app.run(debug=True, port=1753)
