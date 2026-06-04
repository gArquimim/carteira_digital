import mysql.connector
from backend.database import cursor, conn
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash

def is_name_valid(name):
    name_clean = name.strip()
    if not name_clean or len(name_clean) > 100:
        return False
    return True

def is_email_valid(email):
    domains = [
        # microsoft
        "hotmail.com", "outlook.com", "live.com", "msn.com",
        #google
        "gmail.com",
        #yahoo
        "yahoo.com", "yahoo.com.br", "ymail.com",
        #apple
        "icloud.com", "me.com", "mac.com",
        #brazillians
        "bol.com.br", "uol.com.br", "terra.com.br", "ig.com.br", "r7.com",
        #other
        "protonmail.com", "proton.me", "tutanota.com", "zoho.com",
        "aol.com", "mail.com", "gmx.com", "gmx.net",
    ]
    user_email = email.split("@")[-1].lower()
    return user_email in domains

def is_password_valid(password):
    if not password or len(password) < 8:
        return False
    return True

def are_passwords_equal(password,password_confirm):
    return password == password_confirm

def check_inputs_register(nome, email, password, password_confirm):
    error_fields = []
    messages = []

    if not is_name_valid(nome):
        error_fields.append("name-error")
        messages.append("Excede o número maximo de caracteres.")

    if not is_email_valid(email):
        error_fields.append("email-error")
        messages.append("Email inválido.")
    else:
        cursor.execute("""SELECT email FROM users
                       WHERE email = %s""",(email,))
        registered_email = cursor.fetchone()
        if registered_email:
            error_fields.append("email-error")
            messages.append("Email já cadastrado.")

    if not is_password_valid(password):
        error_fields.append("password-error")
        messages.append("Mínimo de 8 caracteres.")
    else:
        if not are_passwords_equal(password, password_confirm):
            error_fields.append("password-error")
            messages.append("As senhas não correspondem.")

    result = {
        "error_fields": error_fields,
        "messages": messages,
    }

    return result

def create_user(name,email,password):
    password_hash = generate_password_hash(str(password))

    try:
        cursor.execute("""INSERT INTO users (name,email,password_hash)
                    VALUES (%s,%s,%s)""",(name, email, password_hash))
        conn.commit()

        return {

            "message": "Cadastro efetuado com sucesso."
        }
    except mysql.connector.IntegrityError:
        return {
            "message": "Email já cadastrado."
        }
    
def login_user(email, password):

    cursor.execute("""SELECT password_hash, id FROM users
                   WHERE email = %s""",(email,))
    data = cursor.fetchone()

    if data:
        password_hash, user_id = data
    
    else:
        return {
            "logged": False,
            "error_field": "email-error",
            "message": "Email não cadastrado.",
        }
    
    if check_password_hash(password_hash, password):
        return {
            "logged": True,
            "user_id": user_id,
            "message": "Login efetuado com sucesso.",
        }
        
    return {
        "logged": False,
        "error_field": "password-error",
        "message": "Senha incorreta.",
    }

def check_inputs_transaction(transaction_type, amount):
    
    valid_types = {"income", "expense"}

    if transaction_type not in valid_types:
        return {
            "error": True,
            "message": "Tipo de transação inválido."
        }
    
    if isinstance(amount, bool):
        return {
            "error": True,
            "message": "Valor inválido."
        }
    
    try:
        float(amount)
    except ValueError:
        return {
            "error": True,
            "message": "Valor inválido."
        }
    
    return None

def calculate_balance(user_id):
    cursor.execute("""SELECT SUM(
                    CASE
                        WHEN type = "expense" THEN -value
                        ELSE value
                    END
                   ) 
                   FROM transactions
                   WHERE user_id = %s""",(user_id,))
    balance = cursor.fetchone()[0]
    
    return float(balance or 0)

def add_expense(user_id,value):
    type = "expense"
    balance = calculate_balance(user_id)

    if value > balance:
        return {
            "error": True,
            "message": "Saldo insuficiente."
        }
    
    cursor.execute("""INSERT INTO transactions (user_id,type,value)
                    VALUES (%s,%s,%s)""",(user_id,type,value))
    note_id = cursor.lastrowid
    conn.commit()
    
    cursor.execute("""SELECT date FROM transactions
                    WHERE id = %s""",(note_id,))
    date_db = cursor.fetchone()[0]

    note_type = type.title()
    value_note = f"-R${value:.2f}"
    note_date = date_db.strftime("%d/%m/%Y %H:%M:%S")

    return {
        "error": False,
        "message": "transação efetuada com sucesso.",
        "note_type": note_type,
        "note_amount": value_note,
        "note_date": note_date,
    }

def add_income(user_id,value):
    type = "income"
    balance = calculate_balance(user_id)

    if value > 1000000 or value + balance > 1000000:
        return {
            "error": True,
            "message": "Excede o limite de saldo permitido."
        }
    
    cursor.execute("""INSERT INTO transactions (user_id,type,value)
                    VALUES (%s,%s,%s)""",(user_id,type,value))
    note_id = cursor.lastrowid
    conn.commit()

    cursor.execute("""SELECT date FROM transactions
                   WHERE id = %s""",(note_id,))
    date_db = cursor.fetchone()[0]

    note_type = type.title()
    value_note = f"+R${value:.2f}"
    note_date = date_db.strftime("%d/%m/%Y %H:%M:%S")

    return {
        "error": False,
        "message": "transação efetuada com sucesso.",
        "note_type": note_type,
        "value_note": value_note,
        "note_date": note_date,
    }

def get_recent_statement(user_id):
    cursor.execute("""SELECT type,value,date FROM transactions
               WHERE user_id = %s
               ORDER BY date DESC
                LIMIT 5""",(user_id,))
    historic = cursor.fetchall()

    if not historic:
        return []
    
    statement = []
    for transaction_type_db, value_db, date_db in historic:
        transaction_type = "Recebimento" if transaction_type_db == "income" else "Pagamento"
        date = date_db.strftime("%d/%m/%Y %H:%M")
        value = f"+ R${value_db:.2f}" if transaction_type_db == "income" else f"- R${value_db:.2f}"

        statement.append({
            "transaction_type":transaction_type,
            "value":value,
            "date":date,
        })
    return statement














