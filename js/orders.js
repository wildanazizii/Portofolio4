document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading orders...');
    loadOrders();
    // Refresh orders every 30 seconds
    setInterval(loadOrders, 30000);

    // Add event listener to contact form
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitOrder(this);
        });
    }
});

async function loadOrders() {
    try {
        console.log('Fetching orders from server...');
        const response = await fetch('../includes/get_orders.php');
        const data = await response.json();
        console.log('Server response:', data);
        
        if (data.success) {
            const ordersList = document.getElementById('ordersList');
            if (!ordersList) {
                console.error('ordersList element not found!');
                return;
            }
            
            if (data.orders.length === 0) {
                ordersList.innerHTML = '<div class="order-item"><div class="order-col" style="grid-column: 1/-1; text-align: center;">No orders found</div></div>';
                return;
            }
            
            ordersList.innerHTML = data.orders.map(order => `
                <div class="order-item">
                    <div class="order-col">#${order.id}</div>
                    <div class="order-col">${order.name}</div>
                    <div class="order-col">${order.email}</div>
                    <div class="order-col">${order.project_type}</div>
                    <div class="order-col message">${order.message}</div>
                    <div class="order-col">
                        <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                    <div class="order-col">${formatDate(order.created_at)}</div>
                    <div class="order-col">
                        <div class="order-actions">
                            <button class="order-btn view-btn" onclick="viewOrder(${order.id})">View</button>
                            <button class="order-btn edit-btn" onclick="editOrder(${order.id})">Edit</button>
                            <button class="order-btn delete-btn" onclick="deleteOrder(${order.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
            console.log('Orders loaded successfully');
        } else {
            console.error('Error from server:', data.message);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function submitOrder(form) {
    try {
        const formData = new FormData(form);
        const response = await fetch('../process_order.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            alert('Order submitted successfully!');
            form.reset();
            loadOrders(); // Reload orders list
        } else {
            alert('Error submitting order. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Error submitting order. Please try again.');
    }
}

async function viewOrder(orderId) {
    try {
        const order = document.querySelector(`.order-item:has([onclick="viewOrder(${orderId})"])`);
        if (order) {
            // Toggle detailed view
            const detailView = order.querySelector('.order-detail');
            if (detailView) {
                detailView.remove();
            } else {
                const details = document.createElement('div');
                details.className = 'order-detail';
                details.innerHTML = `
                    <div class="detail-content">
                        <h3>Order Details #${orderId}</h3>
                        <p><strong>Name:</strong> ${order.children[1].textContent}</p>
                        <p><strong>Email:</strong> ${order.children[2].textContent}</p>
                        <p><strong>Project Type:</strong> ${order.children[3].textContent}</p>
                        <p><strong>Message:</strong> ${order.children[4].textContent}</p>
                        <p><strong>Status:</strong> ${order.children[5].textContent}</p>
                        <p><strong>Created At:</strong> ${order.children[6].textContent}</p>
                    </div>
                `;
                order.appendChild(details);
            }
        }
    } catch (error) {
        console.error('Error viewing order:', error);
        alert('Error viewing order details. Please try again.');
    }
}

async function editOrder(orderId) {
    try {
        const order = document.querySelector(`.order-item:has([onclick="editOrder(${orderId})"])`);
        if (!order) return;

        const currentStatus = order.querySelector('.order-status').textContent;
        const newStatus = prompt('Enter new status (Pending/In Progress/Completed):', currentStatus);
        
        if (newStatus && ['Pending', 'In Progress', 'Completed'].includes(newStatus)) {
            const response = await fetch('../includes/update_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${orderId}&status=${encodeURIComponent(newStatus)}`
            });

            const data = await response.json();
            if (data.success) {
                loadOrders(); // Refresh the orders list
            } else {
                throw new Error(data.message);
            }
        }
    } catch (error) {
        console.error('Error updating order:', error);
        alert('Error updating order status. Please try again.');
    }
}

async function deleteOrder(orderId) {
    try {
        if (confirm('Are you sure you want to delete this order?')) {
            const response = await fetch('../includes/delete_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${orderId}`
            });

            const data = await response.json();
            if (data.success) {
                loadOrders(); // Refresh the orders list
            } else {
                throw new Error(data.message);
            }
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order. Please try again.');
    }
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
