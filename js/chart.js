async function fetchChartData(cypher, valueKey) {
  const session = driver.session();
  try {
    const result = await session.run(cypher);
    const labels = [];
    const data = [];
    result.records.forEach((record) => {
      const nama = record.get("nama");
      const nilai = record.get(valueKey);
      if (nama != null && nilai != null) {
        labels.push(nama);
        data.push(Number(nilai));
      }
    });
    return { labels, data };
  } finally {
    await session.close();
  }
}

const cypher_rating = `
  MATCH (m:Food)
  WHERE exists(m.rating)
  RETURN m.name AS nama, m.rating AS rating
  ORDER BY m.rating DESC
  LIMIT 3
`;

const cypher_kalori = `
  MATCH (m:Food)
  WHERE exists(m.calories)
  RETURN m.name AS nama, m.calories AS kalori
  ORDER BY m.calories DESC
  LIMIT 5
`;

const cypher_popularity = `
  MATCH (m:Food)
  WHERE exists(m.popularity)
  RETURN m.name AS nama, m.popularity AS popularitas
  ORDER BY m.popularity DESC
  LIMIT 3
`;

fetchChartData(cypher_rating, "rating").then(({ labels, data }) => {
  const ctx = document.getElementById("myChart");
  if (!ctx) return;
  const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 400, 0);
  gradient.addColorStop(0, "#ff9a9e");
  gradient.addColorStop(1, "#fad0c4");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Rating",
          data: data,
          borderWidth: 1,
          backgroundColor: gradient,
          borderColor: "#f67280",
          borderRadius: 8,
        },
      ],
    },
    options: {
      indexAxis: "y",
      plugins: {
        title: {
          display: true,
          text: "TOP 3 MAKANAN DENGAN RATING TINGGI",
          font: { size: 18 },
          align: "center",
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 5,
        },
      },
    },
  });
});

fetchChartData(cypher_kalori, "kalori").then(({ labels, data }) => {
  const ctx2 = document.getElementById("myChart2");
  if (!ctx2) return;
  new Chart(ctx2, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Kalori",
          data: data,
          borderWidth: 1,
          backgroundColor: [
            "#8ecae6",
            "#219ebc",
            "#023047",
            "#ffb703",
            "#fb8500",
          ],
          borderColor: "#333",
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "TOP 5 MAKANAN DENGAN KALORI TINGGI",
          font: { size: 18 },
          align: "center",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
});

fetchChartData(cypher_popularity, "popularitas").then(({ labels, data }) => {
  const ctx3 = document.getElementById("myChart3");
  if (!ctx3) return;
  new Chart(ctx3, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Popularitas",
          data: data,
          backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "TOP 3 MAKANAN POPULER",
          font: { size: 18 },
          align: "center",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.label + ": " + context.formattedValue + " vote";
            },
          },
        },
      },
      animation: {
        animateScale: true,
      },
    },
  });
});
