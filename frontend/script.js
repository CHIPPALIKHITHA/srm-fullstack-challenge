async function submitData() {
  const input = document.getElementById("inputData").value;
  const responseBox = document.getElementById("responseBox");

  const dataArray = input
    .split(",")
    .map(item => item.trim())
    .filter(item => item.length > 0);

  try {
    const response = await fetch("https://srm-fullstack-challenge-5jed.onrender.com/bfhl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: dataArray
      })
    });

    const result = await response.json();
    responseBox.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    responseBox.textContent = "API call failed. Please check if backend is running.";
  }
}