from flask import Flask, render_template, jsonify, redirect, request, session
from backend.database import conn, cursor
from backend.services import *
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.secret_key = os.getenv("SECRET_KEY")

# main --------------------------------------------
@app.route("/")
def main():
    if not session.get("logged"):
        return redirect("/login")
    
    user_id = session.get("user_id")
    balance = calculate_balance(user_id)

    return render_template('main.html', balance=balance)


@app.route("/transaction", methods=["POST"])
def transaction():
    data = request.get_json()

    transaction_type = data.get("transactionType")
    amount = data.get("amount")

    if not transaction_type or not amount:
        return jsonify({
            "error": True,
            "message": "Campos obrigatórios ausentes.",
        })

    input_errors = check_inputs_transaction(transaction_type, amount)

    if input_errors:
        return jsonify(input_errors), 400
    else:
        amount = float(amount)

        functions = {
            "expense": add_expense,
            "income": add_income,
        }

        user_id = session.get("user_id")
        transaction_result = functions[transaction_type](user_id, amount)

        if transaction_result.get("error"):
            return jsonify(transaction_result)
        
        else:
            balance = calculate_balance(user_id)
            transaction_result["balance"] = balance

            return jsonify(transaction_result)


@app.route("/recent-statement", methods=["GET"])
def recent_statement():
    user_id = session.get("user_id")

    statement = get_recent_statement(user_id)

    if not statement:
        return jsonify([])
    
    else:
        return jsonify(statement)



#extras ----------------------------------------------
@app.route("/exit-user", methods=["POST"])
def exit_user ():
    
    session.clear()

    return "", 204

# login ----------------------------------------------
@app.route("/login")
def login_page():
    return render_template('login.html')

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    result = login_user(email, password)
    
    if result["logged"]:
        session["logged"] = True
        session["user_id"] = result["user_id"]
    
    return result


#register --------------------------------------------
@app.route("/register")
def register_page():
    return render_template('register.html')

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = " ".join((data.get("name") or "").split()).title()
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()
    password_confirm = (data.get("passwordConfirm") or "").strip()

    input_errors = check_inputs_register(name, email, password, password_confirm)

    if input_errors.get("error_fields"):
        return jsonify(input_errors)
    
    else:
        create_user(name, email, password)
        
        return jsonify({
        "messages": "Cadastro efetuado com sucesso."
        })
    
    