const teams = [
  "Arsenal", "Aston Villa", "Brentford", "Brighton & Hove Albion",
  "Burnley", "Chelsea", "Crystal Palace", "Everton",
  "Leeds United", "Leicester City", "Liverpool", "Manchester City",
  "Manchester United", "Newcastle United", "Norwich City", "Southampton",
  "Tottenham Hotspur", "Watford", "West Ham United", "Wolverhampton Wanderers"
];

const homeSelect = document.getElementById('home_team');
const awaySelect = document.getElementById('away_team');
const manualCheckbox = document.getElementById('manualInputCheckbox');
const manualStatsDiv = document.getElementById('manualStats');


teams.forEach(team => {
  homeSelect.appendChild(new Option(team, team));
  awaySelect.appendChild(new Option(team, team));
});

homeSelect.addEventListener('change', () => {
  const selectedHome = homeSelect.value;
  Array.from(awaySelect.options).forEach(option => {
    option.disabled = option.value === selectedHome;
  });

 
  if (awaySelect.value === selectedHome) {
    awaySelect.value = '';
  }
});

awaySelect.addEventListener('change', () => {
  const selectedAway = awaySelect.value;
  Array.from(homeSelect.options).forEach(option => {
    option.disabled = option.value === selectedAway;
  });


  if (homeSelect.value === selectedAway) {
    homeSelect.value = '';
  }
});

manualCheckbox.addEventListener('change', () => {
  manualStatsDiv.style.display = manualCheckbox.checked ? 'block' : 'none';
});

// Submit form
document.getElementById('predict-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const home_team = homeSelect.value;
  const away_team = awaySelect.value;
  const venue = document.getElementById('venue').value;
  const useManual = manualCheckbox.checked;

  const body = {
    home_team,
    away_team,
    venue,
    use_manual_input: useManual
  };

  if (useManual) {
    body.gf = parseFloat(document.getElementById('home_gf').value);
    body.ga = parseFloat(document.getElementById('home_ga').value);
    body.xg = parseFloat(document.getElementById('home_xg').value);
    body.xga = parseFloat(document.getElementById('home_xga').value);
    body.poss = parseFloat(document.getElementById('home_poss').value);
  }

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '⏳ Predicting...';

  try {
    const response = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (data.prediction) {
      const winner = data.prediction === 'Home' ? home_team : 
                     data.prediction === 'Away' ? away_team : 'Draw';

      resultDiv.innerHTML = `
        🏆 <strong>Predicted Winner:</strong> ${winner}<br/>
        🔍 <strong>Confidence:</strong> ${data.confidence}%`;
    } else {
      resultDiv.innerHTML = `❌ Error: ${data.error}`;
    }
  } catch (err) {
    resultDiv.innerHTML = '❌ Server not reachable!';
  }
});
