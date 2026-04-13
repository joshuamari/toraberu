//#region RENDER
let dispatchChartInstance = null;

function dispatchGraph(dData) {
  const months = dData.map((data) => data.month);
  const rates = dData.map((data) => data.rate);

  const canvas = document.getElementById("dispatchChart");
  const ctx = canvas.getContext("2d");

  if (dispatchChartInstance) {
    dispatchChartInstance.destroy();
  }

  dispatchChartInstance = new Chart(ctx, {
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
              const value = tooltipItem.raw;
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