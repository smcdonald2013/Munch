from flask import Flask, jsonify, request, render_template, abort, jsonify
from flask_cors import CORS, cross_origin
import sqlalchemy
import pandas as pd
import json
import datetime 
import models

application = Flask(__name__, static_url_path='/static')
CORS(application)
application.config.from_object('config')
from config import SQLALCHEMY_DATABASE_URI

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

@application.route("/outline", methods=['GET'])
def outline():
    return render_template('outline.html')

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
            df = models.item_lookup(item_new)
            application.logger.debug(df)
            data = pd.concat([data, df])
        data_final_json = json_format(data)
    else:
        data_df = pd.DataFrame(models.item_lookup())
        data_final_json = json_format(data_df)
    return data_final_json

@application.route('/items', methods=['POST'])
def create_item():
    data = request.data
    application.logger.debug(data)
    data_json = json.loads(data, object_pairs_hook=deunicodify_hook)
    data_df = pd.DataFrame(data_json, index=[0])
    models.sql_insert(data_df, table='Prices')
    return data_df.to_json(orient='values')

#Recipe Endpoints
@application.route('/recipes', methods=['GET'])
def get_recipe():
    if 'recipe' in request.args:
        ids = request.args.get('recipe')
        a = ids.split(",") 
        data = pd.DataFrame()
        for recipe in a:
            #recipe_new = str(recipe).strip('\'') #Need to remove quotes for pymysql to handle strings properly
            df = models.recipe_lookup(recipe)
            text_df, data = recipe_format(df, data, ['Food_Units_Name'])
        data_final_json = json_format(text_df)
    else: 
        data_df = pd.DataFrame(models.recipe_lookup())
        data_json = data_df.groupby('Recipe_Name').apply(lambda x: x.to_json(orient='records'))
        data_json = data_json.apply(lambda x: json.loads(x))
        data_final_json = json_format(data_json.reset_index())
    return data_final_json

@application.route('/recipe_cost', methods=['GET'])
def get_recipe_cost():
    if 'recipe' in request.args:
        ids = request.args.get('recipe')
        a = ids.split(",") 
        data = pd.DataFrame()
        for recipe in a:
            #recipe_new = str(recipe).strip('\'') #Need to remove quotes for pymysql to handle strings properly
            df = models.cost_lookup(recipe)
            text_df, data = recipe_format(df, data, ['Food_Units_Name', 'Ingredient_Cost'])
            text_df['Total_Costs'] = text_df['Food_Units']*text_df['Ingredient_Cost']
            text_df = text_df[["Food_Name", "Food_Units", "Food_Units_Name", "Ingredient_Cost", "Total_Costs"]]
        data_final_json = json_format(text_df)
    else: 
        data_df = pd.DataFrame(models.cost_lookup()['Recipe_Name'].drop_duplicates())
        data_final_json = json_format(data_df)
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
    models.sql_insert(data_df, table='Recipes')
    return data_df.to_json(orient='values')

@application.route("/lists", methods=['GET'])
def get_list():  
    df = models.list_lookup()
    df = df[['Food_Name', 'Num_Cooking_Unit', 'Name_Cooking_Unit']]
    df['Food_Alt_Units'] = ""
    df['Food_Alt_Name'] = ""
    data_final_json = json_format(df)
    return data_final_json

@application.route('/lists', methods=['POST'])
def create_list():
    data = request.data
    #application.logger.debug(data)
    data_json = json.loads(data, object_pairs_hook=deunicodify_hook)
    application.logger.debug(data_json)
    data_df = pd.DataFrame(data_json)
    application.logger.debug(data_df)
    data_df = data_df[['Food Name', 'Food Units', 'Food Units Name']]
    data_df.columns = ['Food_Name', 'Num_Cooking_Unit', 'Name_Cooking_Unit']
    data_df['Date_ID'] = datetime.datetime.now()
    data_df = data_df[['Date_ID','Food_Name', 'Num_Cooking_Unit', 'Name_Cooking_Unit']]
    application.logger.debug(data_df)
    models.sql_insert(data_df, table='Lists')
    return data_df.to_json(orient='values')

@application.route('/links', methods=['GET'])
def get_link():
    data_df = pd.DataFrame(models.links_lookup())
    data_json = data_df.groupby('Recipe_Name').apply(lambda x: x.to_json(orient='records'))
    data_json = data_json.apply(lambda x: json.loads(x))
    data_final_json = json_format(data_json.reset_index())
    return data_final_json

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

def json_format(data_df):
    data_json = data_df.to_json(orient='records')
    data_dict = json.loads(data_json)
    data_dict_final = {'data': data_dict}
    data_final_json = json.dumps(data_dict_final)
    return data_final_json

def recipe_format(df, data, columns):
    application.logger.debug(df)
    df = df.drop(['Recipe_Name'], axis=1)
    data = pd.concat([data, df])
    num_df = data.groupby('Food_Name').sum()['Food_Units']
    text_df = data.drop_duplicates('Food_Name')[['Food_Name'] + columns]
    text_df = text_df.sort_values(by='Food_Name').set_index('Food_Name')
    text_df['Food_Units'] = num_df
    text_df = text_df.round(decimals=2).reset_index()
    text_df = text_df[['Food_Name', 'Food_Units']+columns]
    return text_df, data

if __name__ == "__main__":  
    application.run(host='0.0.0.0', debug=True, extra_files="/static/rest_funcs.js")