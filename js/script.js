const steamId = ""; // steamID goes here
const benchmarkId = 266;
const SPEED = 80;     // seconds per full scroll
const SEAMLESS = true; // toggle seamless
const DELAY = 30000;      // milliseconds to wait after each loop (non-seamless)


const scenarioOrder = [
  "Pasu Voltaic", "B180 Voltaic", "Popcorn Voltaic", "ww3t Voltaic",
  "1w4ts Voltaic", "6 Sphere Hipfire Voltaic", "Smoothbot Voltaic",
  "Air Angelic 4 Voltaic", "PGTI Voltaic", "FuglaaXYZ Voltaic",
  "Ground Plaza Voltaic", "Air Voltaic", "patTS Voltaic",
  "psalmTS Voltaic", "voxTS Voltaic", "kinTS Voltaic",
  "B180T Voltaic", "Smoothbot TS Voltaic"
];

const thresholds = [
  [68, 76, 85, 95, 105, 110.2],
  [78, 88, 98, 108, 115, 123],
  [220, 260, 320, 390, 440, 450],
  [130, 138, 148, 160, 170, 172],
  [115, 120, 130, 142, 152, 156],
  [152, 160, 175, 192, 210, 213],
  [2600, 2900, 3400, 3800, 4000, 4134],
  [2700, 3000, 3400, 3900, 4100, 4226],
  [1100, 1400, 1800, 2200, 2500, 2588],
  [11300, 12500, 13800, 15200, 16000, 16840],
  [862, 870, 880, 888, 894, 896],
  [850, 860, 872, 883, 887, 890.7],
  [91, 97, 103, 110, 116, 118.2],
  [85, 90, 98, 107, 114, 117.5],
  [102, 110, 118, 125, 131, 133],
  [65, 72, 79, 84, 88, 91],
  [64, 70, 78, 85, 92, 95.8],
  [50, 55, 60, 65, 70, 70.4]
];

const rankColors = {
  "Below Jade": "#b1b1b1ff",
  "Jade": "#B6F8B6",
  "Master": "#E7B4F0",
  "Grandmaster": "#FFE791",
  "Nova": "#D2A2FF",
  "Astra": "#FF9DB1",
  "Celestial": "#353333ff"
};

function getRank(score, threshold) {
  const floatScore = score / 100;
  if (floatScore >= threshold[5]) return "Celestial";
  if (floatScore >= threshold[4]) return "Astra";
  if (floatScore >= threshold[3]) return "Nova";
  if (floatScore >= threshold[2]) return "Grandmaster";
  if (floatScore >= threshold[1]) return "Master";
  if (floatScore >= threshold[0]) return "Jade";
  return "Below Jade";
}

function formatScore(score) {
  return (score / 100).toFixed(2);
}

async function loadData() {
  try {
    const res = await fetch(`https://kovaaks.com/webapp-backend/benchmarks/player-progress-rank-benchmark?benchmarkId=${benchmarkId}&steamId=${steamId}`);
    const data = await res.json();

    const allScenarios = {
      ...data.categories.Clicking.scenarios,
      ...data.categories.Tracking.scenarios,
      ...data.categories.Switching.scenarios
    };

    const marquee = document.getElementById("marquee");
    marquee.innerHTML = "";

    const fragment = document.createDocumentFragment();

    scenarioOrder.forEach((name, index) => {
      const scenario = allScenarios[name];
      if (!scenario) return;



      const score = scenario.score;
      const rank = getRank(score, thresholds[index]);
      const color = rankColors[rank] || "#888";
      const scoreText = formatScore(score);



      const span = document.createElement("span");
      span.className = "scenario";
      span.style.background = color;
      span.style.color = rank === "Celestial" ? "#fff" : "#000";
      span.style.border = "2px solid";
      span.textContent = `${name}: ${scoreText} (${rank})`;
      fragment.appendChild(span);
    });

    // Append content
    if (SEAMLESS) {
      marquee.appendChild(fragment.cloneNode(true));
      marquee.appendChild(fragment);
      startScrollSeamless(marquee);
    } else {
      marquee.appendChild(fragment);
      startScrollNormal(marquee);
    }

  } catch (err) {
    console.error("Error loading data:", err);
    document.getElementById("marquee").textContent = "Error loading data.";
  }
}

// Non-seamless scroll (resets per loop) with delay
function startScrollNormal(marquee) {
  const parentWidth = marquee.parentElement.offsetWidth;
  const contentWidth = marquee.scrollWidth;

  function loop() {
    // Reset position instantly
    marquee.style.transition = "none";
    marquee.style.transform = `translateX(${parentWidth}px)`;
    void marquee.offsetWidth; // force reflow

    // Start scroll
    marquee.style.transition = `transform ${SPEED}s linear`;
    marquee.style.transform = `translateX(${-contentWidth}px)`;

    marquee.addEventListener("transitionend", function handler() {
      marquee.removeEventListener("transitionend", handler);

      // Delay before restarting
      setTimeout(loop, DELAY);
    });
  }

  loop();
}

// Seamless scroll using Web Animations API
function startScrollSeamless(marquee) {
  const contentWidth = marquee.scrollWidth / 2;
  marquee.style.width = `${marquee.scrollWidth}px`;
  marquee.style.transform = `translateX(0)`;

  marquee.animate(
    [
      { transform: "translateX(0)" },
      { transform: `translateX(-${contentWidth}px)` }
    ],
    {
      duration: SPEED * 1000,
      iterations: Infinity,
      easing: "linear"
    }
  );
}

// Initial load
loadData();

// Refresh every 30 minutes
setInterval(loadData, 30 * 60 * 1000);
