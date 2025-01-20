lucide.createIcons();

document.addEventListener("DOMContentLoaded", () => {
    const cartItemsList = document.getElementById("cartItemsList");
    const orderNowButton = document.getElementById("orderNowButton");

    const orderPopupOverlay = document.getElementById("orderPopupOverlay");
    const orderItemsSummary = document.getElementById("orderItemsSummary");
    const orderTotalElement = document.getElementById("orderTotal");

    const submitOrderBtn = document.getElementById("submitOrderBtn");
    const cancelOrderBtn = document.getElementById("cancelOrderBtn");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsList.innerHTML = "<p>No items in cart.</p>";
            return;
        }

        let html = "";
        cart.forEach((item, index) => {
            html += `
          <div style="border: 1px solid #000; margin-bottom: 10px; padding: 10px;">
            <img src="${item.image}" alt="${
                item.name
            }" width="80" height="80" />
            <h3>${item.name}</h3>
            <p>Quantity: ${item.quantity}</p>
            ${
                item.option
                    ? `<p>${item.type === "sushi" ? "Spice" : "Size"}: ${
                          item.option
                      }</p>`
                    : ""
            }
            <p>Unit Price: ₱${item.finalUnitPrice}</p>
            <p>Total: ₱${item.totalCost}</p>
            <button class="deleteItemBtn" data-index="${index}">Delete</button>
          </div>
        `;
        });

        cartItemsList.innerHTML = html;

        const deleteButtons = document.querySelectorAll(".deleteItemBtn");
        deleteButtons.forEach((btn) =>
            btn.addEventListener("click", (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                confirmDeleteItem(idx);
            })
        );
    }

    function confirmDeleteItem(index) {
        const userConfirmed = confirm(
            "Are you sure you want to delete this item?"
        );
        if (userConfirmed) {
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCartItems();
        }
    }

    orderNowButton.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        showOrderForm();
    });

    function showOrderForm() {
        orderPopupOverlay.style.display = "block";

        let summaryHtml = "";
        let cartTotal = 0;
        cart.forEach((item) => {
            summaryHtml += `
          <div>
            <strong>${item.name}</strong> (x${item.quantity})
            ${
                item.option
                    ? `<em>[${item.type === "sushi" ? "Spice" : "Size"}: ${
                          item.option
                      }]</em>`
                    : ""
            }
            - ₱${item.totalCost}
          </div>
        `;
            cartTotal += item.totalCost;
        });

        orderItemsSummary.innerHTML = summaryHtml;
        orderTotalElement.textContent = cartTotal;

        const extrasCheckboxes = document.getElementsByName("extras");
        extrasCheckboxes.forEach((cb) =>
            cb.addEventListener("change", () => {
                recalcTotal();
            })
        );
    }

    function recalcTotal() {
        let newTotal = cart.reduce((sum, item) => sum + item.totalCost, 0);

        const extrasCheckboxes = document.getElementsByName("extras");
        extrasCheckboxes.forEach((cb) => {
            if (cb.checked) {
                const cost = parseInt(cb.dataset.cost, 10);
                newTotal += cost;
            }
        });

        orderTotalElement.textContent = newTotal;
    }

    cancelOrderBtn.addEventListener("click", () => {
        orderPopupOverlay.style.display = "none";
    });

    submitOrderBtn.addEventListener("click", () => {
        const userConfirmed = confirm("Place this order?");
        if (!userConfirmed) return;

        let newTotal = parseInt(orderTotalElement.textContent, 10);

        const nameField = document.getElementById("customerName");
        const contactField = document.getElementById("contactNumber");
        const notesField = document.getElementById("additionalNotes");

        const customerName = nameField.value.toUpperCase();
        const contactNumber = contactField.value.toUpperCase();
        const additionalNotes = notesField.value.toUpperCase();

        const orderTypeInputs = document.getElementsByName("orderType");
        let orderTypeValue = "Dine-In";
        orderTypeInputs.forEach((input) => {
            if (input.checked) {
                orderTypeValue = input.value;
            }
        });

        const chosenExtras = [];
        const extrasCheckboxes = document.getElementsByName("extras");
        extrasCheckboxes.forEach((cb) => {
            if (cb.checked) {
                chosenExtras.push({
                    name: cb.value,
                    cost: parseInt(cb.dataset.cost, 10),
                });
            }
        });

        const now = new Date();
        const dateTime = now.toLocaleString();
        const receiptNumber = "RCPT-" + Math.floor(Math.random() * 1000000);
        const newReceipt = {
            receiptNumber,
            dateTime,
            items: cart,
            extras: chosenExtras,
            name: customerName,
            contact: contactNumber,
            notes: additionalNotes,
            orderType: orderTypeValue,
            total: newTotal,
        };

        let receipts = JSON.parse(localStorage.getItem("receipts")) || [];
        receipts.push(newReceipt);
        localStorage.setItem("receipts", JSON.stringify(receipts));

        cart = [];
        localStorage.removeItem("cart");

        window.location.href = "receipts.html";
    });

    renderCartItems();
});
