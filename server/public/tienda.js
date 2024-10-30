let productos = [];

    fetch("./productos.json")
        .then(response => response.json())
        .then(data => {
            productos = data;
            cargarProductos(productos); // Cargar productos inicialmente
        });
    
    const contenedorProductos = document.querySelector("#contenedor-productos");
    const tituloPrincipal = document.querySelector("#titulo-principal");
    let botonesAgregar = document.querySelectorAll(".producto-agregar");
    const numerito = document.querySelector("#numerito");
    
    // Botones para ordenar
    const botonMenor = document.querySelector("#ordenar-menor");
    const botonMayor = document.querySelector("#ordenar-mayor");
    
    function ordenarProductos(criterio) {
        if (criterio === "menor") {
            productos.sort((a, b) => a.precio - b.precio);
        } else if (criterio === "mayor") {
            productos.sort((a, b) => b.precio - a.precio);
        }
        cargarProductos(productos);
    }
    
    botonMenor.addEventListener("click", () => {
        ordenarProductos("menor");
        actualizarClaseActive(botonMenor);
    });
    
    botonMayor.addEventListener("click", () => {
        ordenarProductos("mayor");
        actualizarClaseActive(botonMayor);
    });
    
    function actualizarClaseActive(botonSeleccionado) {
        const botones = document.querySelectorAll(".ordenar-boton");
        botones.forEach(boton => boton.classList.remove("ordenar-active"));
        botonSeleccionado.classList.add("ordenar-active");
    }
    
    function cargarProductos(productosElegidos) {
        contenedorProductos.innerHTML = "";
    
        productosElegidos.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("producto");
    
            const enlace = document.createElement("a");
            enlace.href = `/campanas/${producto.id}`;
            enlace.target = "";
            
    
            const imagenProducto = document.createElement("img");
            imagenProducto.classList.add("producto-imagen");
            imagenProducto.src = producto.imagen;
            imagenProducto.alt = producto.titulo;
    
            enlace.appendChild(imagenProducto);
    
            const detalles = document.createElement("div");
            detalles.classList.add("producto-detalles");
    
            detalles.innerHTML = `
            <h3 class="producto-titulo">${producto.titulo}</h3>
            <p class="producto-precio">$${producto.precio}</p>
            <button class="producto-agregar" id="${producto.id}">Agregar</button>
        `;
        
            div.appendChild(enlace);
            div.appendChild(detalles);
    
            contenedorProductos.append(div);
        });
    
        actualizarBotonesAgregar();
    }
    
    function actualizarBotonesAgregar() {
        botonesAgregar = document.querySelectorAll(".producto-agregar");
    
        botonesAgregar.forEach(boton => {
            boton.addEventListener("click", agregarAlCarrito);
        });
    }
    
    let productosEnCarrito = [];
    let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");
    
    if (productosEnCarritoLS) {
        productosEnCarrito = JSON.parse(productosEnCarritoLS);
        actualizarNumerito();
    }
    
    function agregarAlCarrito(e) {
        const idBoton = e.currentTarget.id;
        const productoAgregado = productos.find(producto => producto.id === idBoton);
    
        if (productosEnCarrito.some(producto => producto.id === idBoton)) {
            const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
            productosEnCarrito[index].cantidad++;
        } else {
            productoAgregado.cantidad = 1;
            productosEnCarrito.push(productoAgregado);
        }
    
        actualizarNumerito();
        localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    }
    
    function actualizarNumerito() {
        let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
        numerito.innerText = nuevoNumerito;
    }
     //scroll
     const menuToggle = document.getElementById('menu-toggle');
     if (menuToggle) {
         menuToggle.addEventListener('change', function() {
             if (this.checked) {
                 document.body.classList.add('no-scroll');
             } else {
                 document.body.classList.remove('no-scroll');
             }
         })}