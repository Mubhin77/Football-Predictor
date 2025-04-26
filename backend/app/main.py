
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and team stats
model = joblib.load('/Users/mubhinbasnet/Desktop/final/backend/app/model.pkl')
team_stats = pd.read_csv('/Users/mubhinbasnet/Desktop/final/backend/app/team_stats.csv')

class MatchInput(BaseModel):
    home_team: str
    away_team: str
    venue: str
    use_manual_input: bool
    gf: Optional[float] = None
    ga: Optional[float] = None
    xg: Optional[float] = None
    xga: Optional[float] = None
    poss: Optional[float] = None


def get_team_features(team_name):
    row = team_stats[team_stats['team'] == team_name]
    if row.empty:
        raise ValueError(f"Team {team_name} not found in stats")
    return row.iloc[0]


@app.post("/predict")
async def predict_match(input_data: MatchInput):
    try:
        if input_data.use_manual_input:
            input_features = {
                'team': input_data.home_team,
                'opponent': input_data.away_team,
                'venue': input_data.venue,
                'gf': input_data.gf,
                'ga': input_data.ga,
                'xg': input_data.xg,
                'xga': input_data.xga,
                'poss': input_data.poss,
            }
        else:
            home_stats = get_team_features(input_data.home_team)

            input_features = {
                'team': input_data.home_team,
                'opponent': input_data.away_team,
                'venue': input_data.venue,
                'gf': home_stats['avg_gf'],
                'ga': home_stats['avg_ga'],
                'xg': home_stats['avg_xg'],
                'xga': home_stats['avg_xga'],
                'poss': home_stats['avg_poss'],
            }

        input_df = pd.DataFrame([input_features])
        pred_proba = model.predict_proba(input_df)
        pred = model.predict(input_df)[0]
        confidence = np.max(pred_proba) * 100

        return {
            "prediction": pred,
            "confidence": round(confidence, 2)
        }

    except Exception as e:
        return {"error": str(e)}
