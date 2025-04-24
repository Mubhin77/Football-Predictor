
const teams = [
  "Arsenal", "Aston Villa", "Brentford", "Brighton & Hove Albion",
  "Burnley", "Chelsea", "Crystal Palace", "Everton",
  "Leeds United", "Leicester City", "Liverpool", "Manchester City",
  "Manchester United", "Newcastle United", "Norwich City", "Southampton",
  "Tottenham Hotspur", "Watford", "West Ham United", "Wolverhampton Wanderers"
];

const homeSelect = document.getElementById('home_team');
const awaySelect = document.getElementById('away_team');


teams.forEach(team => {
  let option1 = document.createElement('option');
  option1.value = team;
  option1.textContent = team;
  homeSelect.appendChild(option1);

  let option2 = document.createElement('option');
  option2.value = team;
  option2.textContent = team;
  awaySelect.appendChild(option2);
});

// ✅ Updated submit handler (this is the only new part!)
document.getElementById('predict-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const home_team = homeSelect.value;
  const away_team = awaySelect.value;
  const venue = document.getElementById('venue').value;

  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');

  resultDiv.innerHTML = '';
  errorDiv.textContent = '';

  try {
    const response = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        home_team,
        away_team,
        venue
      })
    });

    const data = await response.json();

    if (data.prediction) {
      // Find the correct winning team name
      let winningTeamName = '';
      if (data.prediction === 'Home') {
        winningTeamName = home_team;
      } else if (data.prediction === 'Away') {
        winningTeamName = away_team;
      } else {
        winningTeamName = 'Unknown'; // just in case
      }

      // Create logo path (assuming logos are stored in frontend/logos/ and named exactly like team names)
      // const logoPath = `logos/${winningTeamName}.png`;

      // Display result with team name and logo
      resultDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
          <div>
            🏆 Predicted Winner: <b>${winningTeamName}</b> (${data.confidence}% confidence)
          </div>
        </div>
      `;
    } else {
      errorDiv.textContent = `❌ Error: ${data.error}`;
    }
  } catch (error) {
    errorDiv.textContent = '❌ Server not reachable!';
  }
});
