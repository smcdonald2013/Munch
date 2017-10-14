from flask import Flask, jsonify, request, render_template, abort, jsonify
from flask_cors import CORS, cross_origin
import sqlalchemy
import pandas as pd
import json
import datetime 

application = Flask(__name__, static_url_path='/static')
CORS(application)
application.config.from_object('config')
from config import SQLALCHEMY_DATABASE_URI

def item_lookup(item=None):
    engine = sqlalchemy.create_engine(SQLALCHEMY_DATABASE_URI)
    if item is not None:   
        sql_string =  ("SELECT * " 
                        "FROM Prices as p " 
                        "WHERE p.Food_Name = %s ")
        df = pd.read_sql_query(sql_string, engine, params=(item,))
    else: #If no item is provided, pull all of them
        sql_string =  ("SELECT * " 
                       "FROM Prices as p "
                       "ORDER BY p.Food_Name")
        df = pd.read_sql_query(sql_string, engine)
    df['Price_Cooking_Unit'] = df['Price_Purchase_Unit'].divide(df['Num_Cooking_Unit'])
    return df

def recipe_lookup(recipe=None):
    engine = sqlalchemy.create_engine(SQLALCHEMY_DATABASE_URI)
    if recipe is not None:   
        sql_string =  ("SELECT * " 
                        "FROM Recipes as r "
                        "WHERE r.Recipe_Name = %s "
                        "ORDER BY r.Food_Name")
        df = pd.read_sql_query(sql_string, engine, params=(recipe,))
    else: #If no recipe is provided, pull all of them
        sql_string =  ("SELECT * " 
                        "FROM Recipes as r "
                        "ORDER BY r.Recipe_Name")
        df = pd.read_sql_query(sql_string, engine)
    return df

def list_lookup():
    engine = sqlalchemy.create_engine(SQLALCHEMY_DATABASE_URI)
    sql_string =  ("SELECT * " 
                    "FROM ListsNew as l "
                    "WHERE DATE_ID = (SELECT MAX(DATE_ID) as latest_date FROM ListsNew sub)")
    df = pd.read_sql_query(sql_string, engine)
    return df

def sql_insert(data_df, table):
    engine = sqlalchemy.create_engine(SQLALCHEMY_DATABASE_URI)
    data_df.to_sql(table, engine, index=False, if_exists='append')

#Web App URLs (Return html)
@application.route("/")
@application.route('/index', methods=['GET'])
def hello():  
    return render_template('index.html')

@application.route("/item_update", methods=['GET'])
def item_update():
    return render_template('item_update.html')

@application.route("/recipe_update", methods=['GET'])
def recipe_update():
    return render_template('recipe_update.html')

@application.route("/grocery_list", methods=['GET'])
def grocery_list():
    return render_template('grocery_list.html')

@application.route("/edit_list", methods=['GET'])
def edit_list():
    return render_template('edit_list.html')

###Rest API Endpoints (Return JSON)
#Item Endpoints
@application.route("/items", methods=['GET'])
def get_item():  
    if 'item' in request.args:
        ids = request.args.get('item')
        a = ids.split(",") 
        data = pd.DataFrame()
        for item in a:
            item_new = str(item).strip('\'') #Need to remove quotes for pymysql to handle strings properly
            df = item_lookup(item_new)
            application.logger.debug(df)
            data = pd.concat([data, df])
        data_json = data.to_json(orient='records') #Should probably move out of for loop.
        data_dict = json.loads(data_json)
        data_dict_final = {'data': data_dict}
        data_final_json = json.dumps(data_dict_final)
    else:
        data_json =pd.DataFrame(item_lookup()['Food_Name']).to_json(orient='records')
        data_dict = json.loads(data_json)
        data_dict_final = {'data': data_dict}
        data_final_json = json.dumps(data_dict_final)
    return data_final_json

@application.route('/items', methods=['POST'])
def create_item():
    data = request.data
    application.logger.debug(data)
    data_json = json.loads(data, object_pairs_hook=deunicodify_hook)
    data_df = pd.DataFrame(data_json, index=[0])
    sql_insert(data_df, table='Prices')
    return data_df.to_json(orient='values')

#Recipe Endpoints
@application.route('/recipes', methods=['GET'])
def get_recipe():
    if 'recipe' in request.args:
        ids = request.args.get('recipe')
        a = ids.split(",") 
        data = pd.DataFrame()
        for recipe in a:
            recipe_new = str(recipe).strip('\'') #Need to remove quotes for pymysql to handle strings properly
            df = recipe_lookup(recipe)
            application.logger.debug(df)
            df = df.drop(['ID', 'Recipe_Name'], axis=1)
            data = pd.concat([data, df])
            num_df = data.groupby('Food_Name').sum()['Food_Units']
            text_df = data.drop_duplicates('Food_Name')[['Food_Name', 'Food_Units_Name', 'Food_Alt_Units', 'Food_Alt_Name']]
            text_df = text_df.sort_values(by='Food_Name').set_index('Food_Name')
            text_df['Food_Units'] = num_df
            text_df = text_df.round(decimals=2).reset_index()
            #text_df = text_df[["Food_Name", "Food_Units", "Food_Units_Name", "Food_Alt_Name", "Food_Units"]]
            text_df = text_df[["Food_Name", "Food_Units", "Food_Units_Name"]]
            text_df['Food_Alt_Units'] = ""
            text_df['Food_Alt_Name'] = ""
            text_df = text_df[["Food_Name", "Food_Units", "Food_Units_Name", "Food_Alt_Units", "Food_Alt_Name"]]
        data_json = text_df.to_json(orient='records') #Should probably move out of for loop. 
        data_dict = json.loads(data_json)
        data_dict_final = {'data': data_dict}
        data_final_json = json.dumps(data_dict_final)
    else: 
        data_df = pd.DataFrame(recipe_lookup()['Recipe_Name'].drop_duplicates())
        data_json = data_df.to_json(orient='records')
        data_dict = json.loads(data_json)
        data_dict_final = {'data': data_dict}
        data_final_json = json.dumps(data_dict_final)
    return data_final_json

@application.route('/recipes', methods=['POST'])
def create_recipe():
    data = request.data
    application.logger.debug(data)
    data_json = json.loads(data, object_pairs_hook=deunicodify_hook)
    application.logger.debug(data_json)
    data_df = pd.DataFrame(data_json)#.iloc[:-1] #Need to fix so there isn't extra column
    data_df.columns = [x.replace(" ", "_") for x in data_df.columns]
    data_df = data_df[['Recipe_Name','Food_Name', 'Food_Units', 'Food_Units_Name', 'Food_Alt_Units', 'Food_Alt_Name']]
    application.logger.debug(data_df)
    sql_insert(data_df, table='Recipes')
    return data_df.to_json(orient='values')

@application.route("/lists", methods=['GET'])
def get_list():  
    df = list_lookup()
    df = df[['Food_Name', 'Num_Cooking_Unit', 'Name_Cooking_Unit']]
    df['Food_Alt_Units'] = ""
    df['Food_Alt_Name'] = ""
    #data_json = df.to_json(orient='values')
    data_json = df.to_json(orient='records')
    data_dict = json.loads(data_json)
    data_dict_final = {'data': data_dict}
    data_final_json = json.dumps(data_dict_final)
    return data_final_json

@application.route('/lists', methods=['POST'])
def create_list():
    data = request.data
    #application.logger.debug(data)
    data_json = json.loads(data, object_pairs_hook=deunicodify_hook)
    application.logger.debug(data_json)
    data_df = pd.DataFrame(data_json)
    application.logger.debug(data_df)
    #data_df.columns = [x.replace(" ", "_") for x in data_df.columns]
    #data_df.columns = ['Food_Name', 'Num_Cooking_Unit', 'Name_Cooking_Unit']
    #data_df.columns = ['Food_Name', 'Num_Cooking_Unit', 'Name_Cooking_Unit', 'Food_Alt_Units', 'Food_Alt_Name']
    data_df = data_df[['Food Name', 'Food Units', 'Food Units Name']]
    data_df.columns = ['Food_Name', 'Num_Cooking_Unit', 'Name_Cooking_Unit']
    data_df['Date_ID'] = datetime.datetime.now()
    data_df = data_df[['Date_ID','Food_Name', 'Num_Cooking_Unit', 'Name_Cooking_Unit']]
    application.logger.debug(data_df)
    #sql_insert(data_df, table='Lists')
    sql_insert(data_df, table='ListsNew')
    return data_df.to_json(orient='values')

###Helper functions
@application.before_request
def log_request_info():
    application.logger.debug('Headers: %s', request.headers)
    application.logger.debug('Body: %s', request.get_data())

def deunicodify_hook(pairs):
    new_pairs = []
    for key, value in pairs:
        if isinstance(value, unicode):
            value = value.encode('utf-8')
        if isinstance(key, unicode):
            key = key.encode('utf-8')
        new_pairs.append((key, value))
    return dict(new_pairs)

if __name__ == "__main__":  
    application.run(host='0.0.0.0', debug=True, extra_files="/static/rest_funcs.js")