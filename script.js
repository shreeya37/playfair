
const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

// Convert text to uppercase and combine I/J
function cleanText(text) {
    return text.toUpperCase()
        .replace(/[^A-Z]/g, "")
        .replace(/J/g, "I");
}

// Create the 5 x 5 key matrix
function createMatrix(keyword) {
    const key = cleanText(keyword);
    const letters = [...new Set(key + alphabet)];

    return Array.from({ length: 5 }, (_, row) =>
        letters.slice(row * 5, row * 5 + 5)
    );
}

// Find the position of a letter
function findPosition(matrix, letter) {
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (matrix[row][col] === letter) {
                return { row, col };
            }
        }
    }
}

// Divide plaintext into pairs
function preparePairs(text) {
    const clean = cleanText(text);
    const pairs = [];
    let i = 0;

    while (i < clean.length) {
        const first = clean[i];
        const second = clean[i + 1];

        if (!second) {
            pairs.push(first + (first === "X" ? "Q" : "X"));
            i++;
        } else if (first === second) {
            pairs.push(first + (first === "X" ? "Q" : "X"));
            i++;
        } else {
            pairs.push(first + second);
            i += 2;
        }
    }

    return pairs;
}

// Apply the Playfair encryption/decryption rules
function transformPair(pair, matrix, decrypt = false) {
    const a = findPosition(matrix, pair[0]);
    const b = findPosition(matrix, pair[1]);

    let first, second;
    const shift = decrypt ? -1 : 1;

    if (a.row === b.row) {
        // Same row
        first = matrix[a.row][(a.col + shift + 5) % 5];
        second = matrix[b.row][(b.col + shift + 5) % 5];
    } else if (a.col === b.col) {
        // Same column
        first = matrix[(a.row + shift + 5) % 5][a.col];
        second = matrix[(b.row + shift + 5) % 5][b.col];
    } else {
        // Rectangle rule
        first = matrix[a.row][b.col];
        second = matrix[b.row][a.col];
    }

    return first + second;
}

// Main function
function processMessage(decrypt = false) {
    const keyword = document.getElementById("keyword").value;
    const message = document.getElementById("message").value;
    const result = document.getElementById("result");

    if (!cleanText(keyword)) {
        result.textContent = "Please enter a valid keyword.";
        return;
    }

    if (!cleanText(message)) {
        result.textContent = "Please enter a message.";
        return;
    }

    const matrix = createMatrix(keyword);
    let pairs;

    if (decrypt) {
        const cleaned = cleanText(message);

        if (cleaned.length % 2 !== 0) {
            result.textContent =
                "Invalid ciphertext: enter an even number of letters.";
            return;
        }

        pairs = cleaned.match(/.{2}/g) || [];
    } else {
        pairs = preparePairs(message);
    }

    const output = pairs
        .map(pair => transformPair(pair, matrix, decrypt))
        .join("");

    result.textContent = output;
}

// Connect buttons to functions
document.getElementById("encryptBtn").addEventListener("click", () => {
    processMessage(false);
});

document.getElementById("decryptBtn").addEventListener("click", () => {
    processMessage(true);
});

// Copy result
document.getElementById("copyBtn").addEventListener("click", async () => {
    const result = document.getElementById("result").textContent;

    try {
        await navigator.clipboard.writeText(result);
        document.getElementById("copyBtn").textContent = "Copied!";
        setTimeout(() => {
            document.getElementById("copyBtn").textContent = "Copy Result";
        }, 1500);
    } catch {
        alert("Copy failed. Please select and copy the result manually.");
    }
});
