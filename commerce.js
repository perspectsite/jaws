    <script>


        const wrapper = document.getElementById('wrapper');

        wrapper.addEventListener('click', (event) => {
            const isButton = event.target.nodeName === 'BUTTON';
            if (!isButton) {
                return;
            }

            var cartProductsLoc = getCartProduct();
            var cartProductsStr =  localStorage.getItem(cartProductsLoc);
            var parentNode = event.target.parentNode;
            var cardTitle = parentNode.querySelector('.card-title').textContent;
            var prodId = parentNode.querySelector('.card-title').id;
            var productPrice = parentNode.querySelector('.productPrice').textContent.substring(1);
            var buttonClicked = parentNode.querySelector('.btn');
            var buttonCheckmark = parentNode.querySelector('.bi-check-square');
            var buttonId = buttonCheckmark.id;
            $('#' + buttonId).show('slow');

            buttonClicked.disabled = true;

            if (!cartProductsStr){
                var cartProducts = {};
            }
            else{
                var cartProducts = JSON.parse(cartProductsStr)
            }

            if (!(prodId in cartProducts)){
                cartProducts[prodId] = {};
                cartProducts[prodId]['product'] = cardTitle;
                cartProducts[prodId]['count'] = 1;
                cartProducts[prodId]['productPrice'] = productPrice;
            }
            else{
                cartProducts[prodId]['count'] += 1;
            }


            rebuildCart(cartProducts);
            SaveItem(cartProductsLoc, JSON.stringify(cartProducts));
            addListenersToButtons();

            var cartCount = Object.keys(cartProducts).length;
            cart.innerHTML = sumItemsInCart(cartProducts);
            buttonClicked.disabled = false;
        })



      // Create an instance of the Stripe object with your publishable API key
      var stripe = Stripe('{{ stripe_pk_live if site_env and site_env == "live" else stripe_pk_test }}', {
        stripeAccount: '{{ site.stripe_account_id }}',
        });

      var checkoutButton = document.getElementById('checkout-button');

      checkoutButton.addEventListener('click', function(e) {

        checkoutButton.disabled = true;
        checkoutButton.innerHTML='Checkout <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        // Create a new Checkout Session using the server-side endpoint you
        // created in step 3.
        // e.preventDefault();
        const form = document.getElementById('form');
        fetch('/checkout', {
          method: 'POST',
          body: new URLSearchParams(new FormData(form))
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(session) {
        
            checkoutButton.disabled = false;
            checkoutButton.innerHTML='Checkout';
            return stripe.redirectToCheckout({ sessionId: session.id });
        })
        .then(function(result) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, you should display the localized error message to your
          // customer using `error.message`.
          if (result.error) {
            alert(result.error.message);
          }
        })
        .catch(function(error) {
          console.error('Error:', error);
        });
      });
    


        function SaveItem(name, data) {
            localStorage.setItem(name, data);
        };


        function CheckBrowser() {
            if ('localStorage' in window && window['localStorage'] !== null) {
                // We can use localStorage object to store data.
                return true;
            } else {
                    return false;
            }
        }

        function doShowAll() {
            console.log("In doShowAll")
            if (CheckBrowser()) {
                var key = "";
                var list = "<tr><th>Item</th><th>Value</th></tr>\n";
                var i = 0;
                //For a more advanced feature, you can set a cap on max items in the cart.
                for (i = 0; i <= localStorage.length-1; i++) {
                    key = localStorage.key(i);
                    list += "<tr><td>" + key + "</td>\n<td>"
                            + localStorage.getItem(key) + "</td></tr>\n";
                }
                //If no item exists in the cart.
                if (list == "<tr><th>Item</th><th>Value</th></tr>\n") {
                    list += "<tr><td><i>empty</i></td>\n<td><i>empty</i></td></tr>\n";
                }
                //Bind the data to HTML table.
                //You can use jQuery, too.
                // document.getElementById('list').innerHTML = list;
            } else {
                alert('Cannot save shopping list as your browser does not support HTML 5');
            }
        }

        function getCartProduct() {

            var currentPath = window.location.pathname;
            var testPath = "{{ test_path }}";
            var cartProducts = "";
            console.log("testPath: " + testPath);

            if (currentPath.indexOf(testPath) !== -1) {
                cartProducts = "cartProducts-test"
            }
            else{
                cartProducts = "cartProducts-live"
            };
            console.log("Setting cartProducts equal to: " + cartProducts);

            return cartProducts;

        }




        function rebuildCart(cartProducts){

            console.log("cartProducts length: " + Object.keys(cartProducts).length)

            if (Object.keys(cartProducts).length > 0){
                
                var modalBody = document.getElementById("modalBody");
                var cart = document.getElementById('cart');
                var table = document.getElementById("table");
                var tableRowLength = table.rows.length;

                while (table.rows.length > 1) {
                    table.deleteRow(1);
                }

                var totalDue = 0;

                for (var key in cartProducts){

                    var productSubtotal = parseInt(cartProducts[key]['productPrice']) * cartProducts[key]['count'];
                    totalDue += productSubtotal;

                    var row = table.insertRow();
                    var product = row.insertCell(0);
                    var quantity = row.insertCell(1);
                    var subtotal = row.insertCell(2);

                    var currentQuantity = cartProducts[key]['count'];

                    var quantityDropdown = `<td class="btn-group dropright">
                    <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        ${currentQuantity}
                    </button>
                    <div id=${key} class="dropdown-menu" aria-labelledby="dropdownMenu2">
                        <button id="1" class="dropdown-item" type="button">1</button>
                        <button id="2" class="dropdown-item" type="button">2</button>
                        <button id="3" class="dropdown-item" type="button">3</button>
                        <button id="4" class="dropdown-item" type="button">4</button>
                        <button id="5" class="dropdown-item" type="button">5</button>
                        <button id="6" class="dropdown-item" type="button">6</button>
                        <button id="7" class="dropdown-item" type="button">7</button>
                        <button id="8" class="dropdown-item" type="button">8</button>
                        <button id="9" class="dropdown-item" type="button">9</button>
                        <button id="10" class="dropdown-item" type="button">10</button>
                        <div class="dropdown-divider"></div>
                        <button id="remove" class="dropdown-item" type="button">Remove</button>
                    </div>
                    </td>`

                    product.innerHTML = cartProducts[key]['product'] + `<input type="hidden" name="product" value="${key}" />`;
                    quantity.innerHTML = quantityDropdown + `<input type="hidden" name="quantity" value="${cartProducts[key]['count']}" />` ;   
                    subtotal.innerHTML = "$" + productSubtotal + `<input type="hidden" name="subtotal" value="${productSubtotal}" />`;  
                };

                var lastRow = table.insertRow();
                var total = row.insertCell();
                total.innerHTML = "Total: $" + totalDue;

                cart.innerHTML = sumItemsInCart(cartProducts);
            }

            else{
                console.log("Empty cart, so no rebuilding.")
            }

        }

        function sumItemsInCart(cartProducts) {

            var sum = 0;
            for (var key in cartProducts){
                sum += cartProducts[key]['count'];
            };

            return sum
        }


        function addListenersToButtons(){
            const table = document.getElementById('table');
            const dropdownButtons = table.getElementsByClassName('dropdown-item');
            // console.log("Number of dropdown-item in table: "+ dropdownButtons.length);
            
            var cartProductsLoc = getCartProduct();
            for ( var counter = 0; counter < dropdownButtons.length; counter++)
            {
                // console.log("Attaching an event listener for button: " + dropdownButtons[counter]);
                dropdownButtons[counter].addEventListener("click", function(e){

                    var cart = document.getElementById('cart');
                    var cartProductsStr =  localStorage.getItem(cartProductsLoc);
                    var cartProducts = JSON.parse(cartProductsStr);

                    const isButton = event.target.nodeName === 'BUTTON';
                    if (!isButton) {
                        console.log("Not a button clicked, so returning.")
                        return;
                    }
                    else{
                        var newQuantity = event.target.id;
                        var parentNode = event.target.parentNode;
                        var children = parentNode.children;
                        var product_id = parentNode.id;
                        console.log("parentNode.id: " + parentNode.id);
                        // var first_element =  $(this).closest('tr').find(':eq(0)').html();
                        // first_element_parts = first_element.split("<")
                        // var product_changed = first_element_parts[0]
                        // console.log(product_changed + " changed to " + newQuantity)
                        
                    }

                    if (!(product_id in cartProducts)){
                        console.log(product_id + " NOT in cartProducts")
                    }
                    else{

                        if (newQuantity === "remove"){
                            console.log("Deleting " +  product_id);
                            delete cartProducts[product_id];
                            // console.log("new cartProducts: " + cartProducts);

                            if (Object.keys(cartProducts).length === 0){
                                console.log("User trying to delete the last item in the cart.")
                                var table = document.getElementById("table");
                                var tableRowLength = table.rows.length;

                                while (table.rows.length > 1) {
                                    table.deleteRow(1);
                                }

                                cart.innerHTML = sumItemsInCart(cartProducts);
                            }
                        }
                        else{
                            console.log("Updating " + cartProducts[product_id]);
                            cartProducts[product_id]['count'] = parseInt(newQuantity);
                            
                        }  
                    }
                    
                    SaveItem(cartProductsLoc, JSON.stringify(cartProducts));
                    rebuildCart(cartProducts);
                    addListenersToButtons();
                    
                    

            });
            }
        }


        $(document).ready(function() {
            doShowAll();

            var cartProducts = getCartProduct();

            var cart = document.getElementById('cart');
            var cartProductsStr = localStorage.getItem(cartProducts);

            if (cartProductsStr){
                var cartProducts = JSON.parse(cartProductsStr)
                
                rebuildCart(cartProducts);
            }
            else{
                cart.innerHTML = 0;
            }

            addListenersToButtons();
            $('.bi-check-square').hide();

        });


        // $( "#table" ).click(function() {
        //     console.log("Table changed!")
        // });

    </script>
