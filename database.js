var db =window.openDatabase("cong_store","1.0", "Cong Store", 20000);
window.onload = on_load;
function on_load() {
    
    update_cart_quantity();
    }


function initialize_database(){
    db.transaction(function(tx)
{ //
        var query = `CREATE TABLE IF NOT EXISTS city  
         (id INTERGER PRIMARY KEY,
           name  TEXT UNIQUE NOT NULL) `; 
        tx.executeSql(query,[], table_transaction_success(`city`), transaction_error );

        //
        var query = `CREATE TABLE IF NOT EXISTS district (
          id INTEGER PRIMARY KEY,
           name TEXT NOT NULL,
            city_id INTEGER NOT NULL,
             FOREIGN KEY(city_id) REFERENCES city(id))`;
        tx.executeSql(query,[], table_transaction_success(`district`), transaction_error );
       //
       var query = `CREATE TABLE IF NOT EXISTS ward (id INTEGER PRIMARY KEY,
         name TEXT NOT NULL,
          district_id INTEGER NOT NULL,
           FOREIGN KEY(district_id) REFERENCES district(id))`;
       tx.executeSql(query,[],  table_transaction_success(`ward`), transaction_error );

      //
  query=`CREATE TABLE IF NOT EXISTS account ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
     username TEXT UNIQUE NOT NULL,
      password TEXT  NOT NULL,
      first_name TEXT NULL,
       last_name TEXT NULL,
        phone TEXT  NULL,  
        street TEXT NULL,
        ward_id INTEGER NULL,
        district_id INTEGER NULL,
        city_id INTEGER NULL,    
            status INTEGER NOT NULL,
             FOREIGN KEY(city_id) REFERENCES city(id))`;
 tx.executeSql(query,[],  table_transaction_success(`account`), transaction_error );
    
   //
   var query=`CREATE TABLE IF NOT EXISTS category(
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT UNIQUE  NOT NULL,
      description TEXT NULL,
       parent_id INTEGER NULL,
       FOREIGN KEY(parent_id) REFERENCES category(id)) `;
   tx.executeSql(query,[],  table_transaction_success(`category`), transaction_error );


   //
   var query= `CREATE TABLE IF NOT EXISTS product(
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT  NOT NULL,
     category_id INTEGER NOT NULL,
      description TEXT NULL,
       price REAL NOT NULL,
       FOREIGN KEY(category_id) REFERENCES category(id))`;
   tx.executeSql(query,[],  table_transaction_success(`products`), transaction_error );
  

   //
   var query=`CREATE TABLE IF NOT EXISTS cart(
     id INTEGER PRIMARY KEY,
      account_id INTEGER NOT NULL,
       product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
         FOREIGN KEY(account_id) REFERENCES account(id),
          FOREIGN KEY(product_id) REFERENCES product(id))`;
   tx.executeSql(query,[], table_transaction_success(`cart`), transaction_error );
//

}); 
}
var account_id = localStorage.getItem("account_id");

if(account_id !=""){login_success();}
else{logout();}








 function fetch_database(){
   db.transaction(function(tx){
     var query = `INSERT INTO category (name, description) VALUES (?, ?)`;
     tx.executeSql(query, ["Size 1", "Description 01"], fetch_transaction_sucess("Category 01"),
     transaction_error);
     tx.executeSql(query, ["Size 2", "Description 02"], fetch_transaction_sucess("Category 02"),
     transaction_error);
     tx.executeSql(query, ["Size 3", "Description 03"], fetch_transaction_sucess("Category 03"),
     transaction_error);
   });
 }


//
function  fetch_transaction_sucess(name){log(`INFO`, `INSERT "${name}" successfully.`);}
function log(type, message) { var current_time = new Date(); 
  console.log(`${current_time} [${type}] ${message}`);}
  function table_transaction_success(table) {log(`INFO`, `Create table "${table}" successfully.`); }
  
function transaction_error(tx, error) { log(`ERROR`, `SQL Error ${error.code}: ${error.message}`);}





//////////////////////////////////////////
function get_product(){
  db.transaction( function(tx)   {
     var query =`SELECT p.id,  p.name, p.price, c.name AS category_name
      FROM  product p, category c
      WHERE  p.category_id = c.id`;
     tx.executeSql(query, [], function(tx, result) {log(`INFO`,` Get a list products sucessfully.`);
     show_product(result.rows);},
      transaction_error );
    
  });
}

function show_product(products) {
  var product_list = document.getElementById("product-list");

  for (var product of products) {
    product_list.innerHTML += `
      <div class="col-6 col-sm-4 col-lg-3 mt-3 p-3 product">
        <div class="product-img">
          <img src="image/GIACN214-1-400x600.jpg" alt="${product.name}" > 
        </div>
      
        <div class="product-name">${product.name}</div>
        <div class="product-category">${product.category_name}</div>
        <div class="product-price">${product.price} VNĐ</div>
      
        <div class="text-end">
          <button onclick="add_to_cart(this.id)" id="${product.id}" class="btn btn-info btn-sm">Add to Cart</button>
        </div>
      </div>
    `;
  }
}

  


 document.getElementById('formlogin').onsubmit = login1;

function login1(e)
{
    e.preventDefault();
    // get information <input>
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;


    db.transaction(function(tx){
        var query = 'SELECT * FROM account WHERE username = ? AND password = ?'; 
     tx.executeSql(
   query,
     [username, password], 
     function(tx, result){
    if (result.rows[0] )
{
   $("#formlogin").modal("hide");
 localStorage.setItem("account_id", result.rows[0].id);
 localStorage.setItem("account_username", result.rows[0].username);
 login_success();
}

else { 
   alert("Login failed");
   logout();
    }
},
transaction_error);
});

}   
function login_success()
{
var username= localStorage.getItem("account_username");
document.getElementById("account-info").innerHTML=`
<a   href="cart.html" class=" btn btn-outline-light" >Order (<span id="cart-quantity">0</span>)</a>

<a class="btn btn-outline-dark ms-3" href="profile.html" > ${username} </a>
<button class="btn btn-outline-light ms-3" onclick="logout()">Logout</button>

`;
}
function logout() {
  localStorage.setItem("account_id", "");
  localStorage.setItem("account_username", "");
  document.getElementById("account-info").innerHTML =
  `<button class="btn btn-outline-light ms-3" data-bs-toggle="modal" data-bs-target="#formlogin">Login</button>`
}
 
////////////////////////////////////////////////
function add_to_cart(product_id) {
  var account_id = localStorage.getItem("account_id");
  db.transaction (function(tx) {
var query ="SELECT quantity FROM cart WHERE account_id = ? AND product_id= ?";
tx.executeSql(
  query,
   [account_id, product_id], 
  function(tx, result) {
    if(result.rows[0]){
      update_cart_database(product_id, result.rows[0].quantity + 1);
    }
    else {add_cart_database(product_id);}
    }, transaction_error);
  }); 
}

function update_cart_database(product_id, quantity){
  var account_id =localStorage.getItem("account_id");
  db.transaction(function(tx){
    var query= "UPDATE cart SET quantity = ? WHERE account_id = ? AND product_id = ?";
  tx.executeSql(
    query, 
    [quantity, account_id, product_id],
     function(tx, result) {
    log(`INFO`, `UPDATE cart successfully`);
    update_cart_quantity();
  },
  transaction_error);
});
}

  
  function add_cart_database (product_id)
   {var account_id= localStorage.getItem("account_id");
 
  db. transaction(function (tx) { 
  var query = `INSERT INTO cart (account_id, product_id, quantity) VALUES ( ? ,?,?)`; 
  tx. executeSql(
  query, 
  [account_id, product_id, 1],
  function(tx, result) {
    log( `INFO`, `INSERT cart sucessfully`);
    update_cart_quantity();
  },
  transaction_error);
});
  
}
////
function update_cart_quantity(){
  var account_id =localStorage.getItem("account_id");
  db.transaction(function(tx){
    var query =`SELECT SUM(quantity) AS total_quantity FROM cart WHERE account_id =?`;
    tx.executeSql(
      query,
      [account_id],
      function(tx, result) {
        if(result.rows[0].total_quantity)
        {document.getElementById("cart-quantity").innerHTML=
      result.rows[0].total_quantity;}
      else {
        document.getElementById("cart-quantity").innerHTML=0;
      }
      },
    transaction_error);
  });
}



function get_cart_list() {
  var account= localStorage.getItem("account_id");
  db.transaction(function(tx){
      var query =`SELECT p.id, p.name, p.price, c.quantity
      FROM cart c, product p
      WHERE p.id = c.product_id AND c.account_id = ?
      ORDER by (p.name)`;
      tx.executeSql(
          query, [account_id],
          function(tx, result) {
              log(`INFO`, `Get list of cart successfully`);
              show_cart_list(result.rows);
          },
     transaction_error);

  });
}
function show_cart_list(products){
  var  total=0;
  var cart_list = document.getElementById("cart-list");
  for(var product of products) {
    var amount = product.price * product.quantity;
    total += amount;
    cart_list.innerHTML +=`

    <tr id="cart-list-item-${product.id}">
    <td id="cart-list-name-${product.id}">${product.name}</td>
    <td >${product.quantity}</td>
    <td>${product.price}</td>
    <td>${amount}</td>
    <td>
    <button  onclick="detele_cart_item(this.id)" id="${product.id}" class="btn btn-danger btn-sm">Deltete</button></td>
    </tr>`;
  }
  cart_list.innerHTML +=`
  <tr>
  <td></td>
  <td></td>
  <td>Total</td>
  <td>${total}</td>
  <td>
  <button class="btn btn-info btn-sm">Order</button></td>
  </tr>`;
}
function detele_cart_item(product_id){
  var account_id = localStorage.getItem("account_id");


  db.transaction(function(tx) {
    var query ="DELETE FROM cart WHERE account_id = ? AND product_id = ?";


    tx.executeSql(
      query,
       [account_id, product_id],
        function(tx, result) {
      var product_name = document.getElementById(
        `cart-list-name-${product_id}`);

        var message =` Delete "${product_name.innerText}" sucessfully`;

      document.getElementById(`cart-list-item-${product_id}`).outerHTML="";
      log(`INFO`, message);
      alert(message);
      update_cart_quantity();
      
    },
      transaction_error);
    });
  }
