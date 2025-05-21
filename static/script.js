
let ws;
let drawnHistory = [];
let card = [];
let playerName = "";

function joinGame() {
    playerName = document.getElementById("player-name").value;
    if (!playerName) return alert("Ingresa tu nombre");
    document.getElementById("game").style.display = "block";
    document.getElementById("display-name").innerText = playerName;
    ws = new WebSocket(`ws://${location.host}/ws`);
    ws.onmessage = (event) => {
        const msg = event.data;
        if (msg.startsWith("number:")) {
            const number = msg.split(":")[1];
            document.getElementById("number").innerText = "Número: " + number;
            drawnHistory.push(number);
            document.getElementById("history").innerText = "Historial: " + drawnHistory.join(", ");
            document.getElementById("sound").play();
            markNumber(parseInt(number));
        } else if (msg.startsWith("bingo:")) {
            const name = msg.split(":")[1];
            alert("🎉 ¡" + name + " ha cantado BINGO!");
        }
    };
    generateCard();
}

function drawNumber() {
    ws.send("draw");
}

function markNumber(num) {
    document.querySelectorAll("#bingo-card td").forEach(td => {
        if (parseInt(td.innerText) === num) {
            td.classList.add("marked");
            td.setAttribute("data-marked", "true");
        }
    });
    checkBingo();
}

function checkBingo() {
    const rows = document.querySelectorAll("#bingo-card tr");
    for (let i = 0; i < 5; i++) {
        let rowMarked = 0;
        for (let j = 0; j < 5; j++) {
            if (rows[i].children[j].classList.contains("marked")) {
                rowMarked++;
            }
        }
        if (rowMarked === 5) {
            ws.send("bingo:" + playerName);
        }
    }
}

function generateCard() {
    const used = new Set();
    let html = "";
    for (let i = 0; i < 5; i++) {
        html += "<tr>";
        for (let j = 0; j < 5; j++) {
            let n;
            do {
                n = Math.floor(Math.random() * 75) + 1;
            } while (used.has(n));
            used.add(n);
            html += `<td>${n}</td>`;
        }
        html += "</tr>";
    }
    document.getElementById("bingo-card").innerHTML = html;
}
