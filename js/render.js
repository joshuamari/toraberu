//#region RENDER
function dispatchGraph(dData) {
  const months = dData.map((data) => data.month);
  const rates = dData.map((data) => data.rate);

  const ctx = document.getElementById("dispatchChart").getContext("2d");
  const dispatchChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "(End of month)",
          data: rates,
          backgroundColor: "#dcfce7",
          borderColor: "#22c55e",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              var value = tooltipItem.raw;
              return (
                value +
                " " +
                (value > 1 ? "dispatch members" : "dispatch member")
              );
            },
          },
        },
      },
    },
  });
}
//#endregion
