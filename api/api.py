import time
from flask import Flask
from datetime import datetime
import os
import re
import requests 
import pandas as pd
from bs4 import BeautifulSoup


app = Flask(__name__)

@app.route('/data')

def get_data():
    link = 'https://covid19.assam.gov.in/all-districts/'
    req = requests.get(link)
    soup = BeautifulSoup(req.content, "html.parser")
    thead = soup.find_all('thead')[0]
    head = thead.find_all('tr')
    tbody = soup.find_all('tbody')[0]
    body = tbody.find_all('tr')
    head_rows = []
    body_rows = []
    for tr in head:
        td = tr.find_all(['th', 'td'])
        row = [i.text.strip() for i in td]
        head_rows.append(row)
    
    for tr in body:
        td = tr.find_all(['th', 'td'])
        row = [i.text.strip() for i in td]
        body_rows.append(row)
    
    df_bs = pd.DataFrame(body_rows[:], columns=head_rows[0])
    df_bs[["Confirmed", "Active", "Recovered", "Deceased"]] = df_bs[["Confirmed", "Active", "Recovered", "Deceased"]].astype(int)
    df_bs[["District"]] = df_bs[["District"]].astype(str)
    df_bs.set_index(['District'], inplace = True)
    cList = df_bs.to_dict('index')
    finalJSON = dict(Assam=cList)

    return finalJSON

