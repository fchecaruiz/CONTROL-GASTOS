let saldoInicial = parseFloat(localStorage.getItem("saldoInicial")) || 0;
let saldoFinal = saldoInicial;
let interfazActiva = true;
let gastosConFecha = [];

let categorias = {
  alimentacion: 0, ocio: 0, gasoil: 0, calefaccion: 0, hipoteca: 0,
  luz: 0, agua: 0, internet: 0, otros: 0, transporte: 0
};

let categoriaSeleccionada = "";

function updateUI() {
  document.getElementById("saldoDisplay").innerText = `Saldo: ${saldoFinal.toFixed(2)}€`;
  document.getElementById("totalGastado").innerText = `Total Gastado: ${calcularTotalGastos().toFixed(2)}€`;

  const porcentaje = saldoInicial > 0 ? (saldoFinal / saldoInicial) * 100 : 0;
  console.log("Porcentaje:", porcentaje);

  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = `${Math.max(porcentaje, 0)}%`;

  if (saldoFinal <= 100) {
    progressBar.style.backgroundColor = "#e74c3c";
  } else if (saldoFinal <= 500) {
    progressBar.style.backgroundColor = "#f39c12";
  } else if (saldoFinal <= 1000) {
    progressBar.style.backgroundColor = "#2ecc71";
  } else {
    progressBar.style.backgroundColor = "#3498db";
  }

  for (let categoria in categorias) {
    const elemento = document.querySelector(`[data-categoria=${categoria}]`);
    const gasto = categorias[categoria];
    if (elemento) {
      elemento.querySelector("span").innerText = `${gasto.toFixed(2)}€`;

      if (gasto === 0) {
        elemento.style.backgroundColor = "#2980b9";
      } else if (gasto < 50) {
        elemento.style.backgroundColor = "#2ecc71";
      } else if (gasto < 150) {
        elemento.style.backgroundColor = "#f39c12";
      } else {
        elemento.style.backgroundColor = "#e74c3c";
      }

      elemento.style.color = "white";
    }
  }
}

function showGastoModal(categoria) {
  document.getElementById("gastoCategoria").innerText = categoria.charAt(0).toUpperCase() + categoria.slice(1);
  document.getElementById("gastoModal").style.display = "block";
  document.getElementById("gastoInput").dataset.categoria = categoria;
  categoriaSeleccionada = categoria;
}

function addGasto() {
  const categoria = document.getElementById("gastoInput").dataset.categoria;
  const gasto = parseFloat(document.getElementById("gastoInput").value);
  if (!isNaN(gasto) && gasto > 0) {
    saldoFinal -= gasto;
    categorias[categoria] += gasto;

    const now = new Date();
    const mesAnio = `${now.getMonth() + 1}-${now.getFullYear()}`;
    gastosConFecha.push({ categoria, cantidad: gasto, fecha: now.toLocaleDateString(), mesAnio });

    updateUI();
    poblarFiltroMes();
    mostrarHistorial();
  }
  document.getElementById("gastoModal").style.display = "none";
  document.getElementById("gastoInput").value = "";
}

function resetApp() {
  saldoInicial = 0;
  saldoFinal = 0;
  for (let key in categorias) categorias[key] = 0;
  localStorage.clear();
  location.reload();
}

document.querySelectorAll(".categoria").forEach(item => {
  item.addEventListener("click", () => {
    if (!interfazActiva) return;

    const categoria = item.dataset.categoria;

    if (categoria === "otros") {
      mostrarInputPersonalizado();
    } else {
      showGastoModal(categoria);
    }
  });
});

document.getElementById("gastoSubmit").addEventListener("click", addGasto);
document.getElementById("gastoCancel").addEventListener("click", () => document.getElementById("gastoModal").style.display = "none");
document.getElementById("gastoDelete").addEventListener("click", () => document.getElementById("gastoInput").value = "");
document.getElementById("x").addEventListener("click", () => {
  document.getElementById("gastoModal").style.display = "none";
  document.getElementById("toast").style.display = "none";
});

document.getElementById("borrarGastoCompleto").addEventListener("click", () => {
  if (categoriaSeleccionada) {
    saldoFinal += categorias[categoriaSeleccionada];
    categorias[categoriaSeleccionada] = 0;
    updateUI();
    categoriaSeleccionada = "";
    document.getElementById("gastoModal").style.display = "none";
    document.getElementById("toast").style.display = "none";
  }
});

document.getElementById("borrarTodosGastos").addEventListener("click", () => {
  desactivarInterfaz();
  const toast = document.getElementById("toastCategoria");
  toast.style.display = "block";
  toast.style.top = "50%";
  toast.style.left = "50%";
  toast.style.transform = "translate(-50%, -50%)";
});

document.getElementById("avisoSi").addEventListener("click", () => {
  for (let categoria in categorias) {
    categorias[categoria] = 0;
  }
  gastosConFecha = [];
  localStorage.removeItem("gastosConFecha");
  saldoFinal = saldoInicial - calcularTotalGastos();

  updateUI();
  mostrarHistorial();
  guardarDatos();

  document.getElementById("toastCategoria").style.display = "none";
  document.getElementById("gastoModal").style.display = "none";

  const confirmToast = document.getElementById("toastConfirmacionCategoria");
  confirmToast.style.display = "block";
  confirmToast.style.top = "50%";
  confirmToast.style.left = "50%";
  confirmToast.style.transform = "translate(-50%, -50%)";

  setTimeout(() => {
    confirmToast.style.display = "none";
    activarInterfaz();
  }, 2000);
});

document.getElementById("resetButton").addEventListener("click", () => {
  desactivarInterfaz();
  const toast = document.getElementById("toast");
  toast.style.display = "block";
  toast.style.top = "50%";
  toast.style.left = "50%";
  toast.style.transform = "translate(-50%, -50%)";
});

document.getElementById("toastConfirm").addEventListener("click", () => {
  document.getElementById("toast").style.display = "none";
  const toast2 = document.getElementById("toast2");
  toast2.style.display = "block";
  toast2.style.top = "50%";
  toast2.style.left = "50%";
  toast2.style.transform = "translate(-50%, -50%)";
});

document.getElementById("toastCancel").addEventListener("click", () => {
  document.getElementById("toast").style.display = "none";
  activarInterfaz();
});

document.getElementById("toast2Confirm").addEventListener("click", resetApp);

document.getElementById("toast2Cancel").addEventListener("click", () => {
  document.getElementById("toast2").style.display = "none";
  activarInterfaz();
});

document.getElementById("addSaldoButton").addEventListener("click", () => {
  const input = document.getElementById("nuevoSaldoInput");
  const saldoExtra = parseFloat(input.value);
  if (!isNaN(saldoExtra) && saldoExtra > 0) {
    saldoInicial += saldoExtra;
    localStorage.setItem("saldoInicial", saldoInicial);
    actualizarSaldo();
    input.value = "";
  } else {
    document.getElementById('saldoSeguro').style.display = 'block';
    desactivarInterfaz();
    setTimeout(() => {
      document.getElementById('saldoSeguro').style.display = 'none';
      activarInterfaz();
    }, 2000);
  }
});

document.getElementById("borrarSaldoButton").addEventListener("click", () => {
  borrarSaldo();
});

function actualizarSaldo() {
  saldoInicial = parseFloat(localStorage.getItem("saldoInicial")) || 0;
  let totalGastos = calcularTotalGastos();
  saldoFinal = saldoInicial - totalGastos;
  updateUI();
}

function calcularTotalGastos() {
  let total = 0;
  for (let categoria in categorias) {
    total += categorias[categoria];
  }
  return total;
}

document.addEventListener("DOMContentLoaded", () => {
  saldoInicial = parseFloat(localStorage.getItem("saldoInicial")) || 0;
  saldoFinal = parseFloat(localStorage.getItem("saldoFinal")) || saldoInicial;
  categorias = JSON.parse(localStorage.getItem("categorias")) || categorias;
  gastosConFecha = JSON.parse(localStorage.getItem("gastosConFecha")) || [];
  poblarFiltroMes(); 
  mostrarHistorial();

  updateUI();
});

document.getElementById("guardarDatosBtn").addEventListener("click", guardarDatos);

function guardarDatos() {
  localStorage.setItem("saldoInicial", saldoInicial);
  localStorage.setItem("categorias", JSON.stringify(categorias));
  localStorage.setItem("saldoFinal", saldoFinal);

  if (gastosConFecha.length === 0) {
    localStorage.removeItem("gastosConFecha");
  } else {
    localStorage.setItem("gastosConFecha", JSON.stringify(gastosConFecha));
  }

  mostrarToast();
}

function mostrarToast() {
  const toast = document.getElementById("toastGuardarDatos");
  toast.style.background = saldoFinal <= 0 ? 'red' : 'blue';
  toast.innerText = saldoFinal <= 0
    ? "⚠️No se puede guardar datos, saldo insuficiente"
    : "✅Datos guardados correctamente";

  desactivarInterfaz();
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
    activarInterfaz();
  }, 2000);
}

function borrarSaldo() {
  const toast = document.getElementById("toastBorrarSaldo");

  if (saldoFinal > 0) {
    desactivarInterfaz();
    toast.innerHTML = `
      ⚠️ Se va a borrar TODO EL SALDO y el HISTORIA DE GASTOS. ¿Estas seguro?<br>
      <button id="confirmarBorrado">Sí, borrar</button>
      <button id="cancelarBorrado">Cancelar</button>
    `;
    toast.style.display = "block";

    document.getElementById("confirmarBorrado").onclick = () => {
      toast.style.background = 'green';
      toast.innerText = "✅ Saldo borrado correctamente";
      localStorage.removeItem("saldoInicial");
      localStorage.removeItem("categorias");
      localStorage.removeItem("saldoFinal");
      localStorage.removeItem("gastosConFecha");

      setTimeout(() => {
        toast.style.display = "none";
        location.reload();
      }, 1000);
    };

    document.getElementById("cancelarBorrado").onclick = () => {
      toast.style.display = "none";
      activarInterfaz();
    };
  } else {
    toast.style.background = 'red';
    toast.innerText = "⚠️ No se puede borrar el saldo, saldo insuficiente";
    toast.style.display = "block";
    desactivarInterfaz();
    setTimeout(() => {
      toast.style.display = "none";
      activarInterfaz();
    }, 3000);
  }
}

function desactivarInterfaz() {
  interfazActiva = false;
  document.querySelectorAll("button, input").forEach(el => {
    if (!el.closest("#toast") && !el.closest("#toast2") && !el.closest("#toastCategoria")) {
      el.disabled = true;
    }
  });
}

function activarInterfaz() {
  interfazActiva = true;
  document.querySelectorAll("button, input").forEach(el => el.disabled = false);
}

// NUEVA FUNCIÓN: Rellenar el filtro de mes
function poblarFiltroMes() {
    const selectMes = document.getElementById("select-mes");
    if (!selectMes) return;

    selectMes.innerHTML = "";
    
    const mesesConGastos = [...new Set(gastosConFecha.map(gasto => gasto.mesAnio))];
    
    mesesConGastos.sort((a, b) => {
        const [mesA, anioA] = a.split('-');
        const [mesB, anioB] = b.split('-');
        return new Date(anioA, mesA - 1) - new Date(anioB, mesB - 1);
    });

    const nombresMes = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    mesesConGastos.forEach(mesAnio => {
        const [mes, anio] = mesAnio.split('-');
        const nombreMes = nombresMes[parseInt(mes) - 1];
        const option = document.createElement("option");
        option.value = mesAnio;
        option.text = `${nombreMes} - ${anio}`;
        selectMes.appendChild(option);
    });

    if (gastosConFecha.length > 0) {
        selectMes.value = gastosConFecha[gastosConFecha.length - 1].mesAnio;
    }

    selectMes.addEventListener('change', mostrarHistorial);
}

// FUNCIÓN MODIFICADA: Mostrar el historial filtrado
function mostrarHistorial() {
    const historial = document.getElementById("historialGastos");
    const selectMes = document.getElementById("select-mes");
    const mesSeleccionado = selectMes ? selectMes.value : null;

    historial.innerHTML = "";

    const gastosFiltrados = mesSeleccionado
        ? gastosConFecha.filter(gasto => gasto.mesAnio === mesSeleccionado)
        : gastosConFecha;

    if (gastosFiltrados.length === 0 && mesSeleccionado) {
        historial.innerHTML = "<li>No hay gastos para este mes.</li>";
        return;
    }

    gastosFiltrados.forEach((gasto, index) => {
        const item = document.createElement("li");
        item.style.position = "relative";

        const eliminarGasto = document.createElement("span");
        eliminarGasto.textContent = "✖";
        eliminarGasto.classList.add("eliminar-gasto-rect");
        eliminarGasto.title = "Eliminar gasto";
        eliminarGasto.addEventListener("click", () => {
            const originalIndex = gastosConFecha.findIndex(g => g === gasto);
            eliminarGastoHistorial(originalIndex);
        });

        const modificarHistorialGasto = document.createElement("span");
        modificarHistorialGasto.textContent = "Modificar Gasto";
        modificarHistorialGasto.classList.add("modificar-gasto");
        modificarHistorialGasto.addEventListener("click", () => {
            const originalIndex = gastosConFecha.findIndex(g => g === gasto);
            abrirModalEditarGasto(originalIndex);
        });

        const texto = document.createElement("span");
        texto.textContent = `${gasto.categoria} - ${gasto.cantidad.toFixed(2)}€ - ${gasto.fecha}`;
        
        item.appendChild(eliminarGasto);
        item.appendChild(texto);
        item.appendChild(modificarHistorialGasto);

        if (gasto.cantidad < 100) {
            item.style.backgroundColor = "#2ecc71";
        } else if (gasto.cantidad < 300) {
            item.style.backgroundColor = "#f39c12";
        } else if (gasto.cantidad < 700) {
            item.style.backgroundColor = "#e67e22";
        } else {
            item.style.backgroundColor = "#e74c3c";
        }

        historial.appendChild(item);
    });
}

// ----------- RESTO DEL CÓDIGO IGUAL -----------

function eliminarGastoHistorial(index) {
  const gasto = gastosConFecha[index];
  saldoFinal += gasto.cantidad;
  const categoria = gasto.categoria.includes("otros") ? "otros" : gasto.categoria;
  categorias[categoria] -= gasto.cantidad;

  gastosConFecha.splice(index, 1);

  updateUI();
  poblarFiltroMes();
  mostrarHistorial();
  guardarDatosSinToast();
}

function mostrarInputPersonalizado() {
  document.getElementById("modalOtros").style.display = "block";

  document.getElementById("guardarGastoOtros").onclick = () => {
    const nombre = document.getElementById("nombreGastoOtros").value.trim();
    const cantidad = parseFloat(document.getElementById("importeGastoOtros").value);

    if (nombre && !isNaN(cantidad) && cantidad > 0) {
      saldoFinal -= cantidad;
      categorias.otros += cantidad;

      const now = new Date();
      const mesAnio = `${now.getMonth() + 1}-${now.getFullYear()}`;
      gastosConFecha.push({
        categoria: `otros (${nombre})`,
        cantidad,
        fecha: now.toLocaleDateString(),
        mesAnio
      });

      updateUI();
      poblarFiltroMes();
      mostrarHistorial();
    }

    document.getElementById("modalOtros").style.display = "none";
    document.getElementById("nombreGastoOtros").value = "";
    document.getElementById("importeGastoOtros").value = "";
  };

  document.getElementById("borrarGastoOtros").onclick = () => {
    document.getElementById("nombreGastoOtros").value = "";
    document.getElementById("importeGastoOtros").value = "";
  };
}

document.getElementById("xOtros").addEventListener("click", () => {
  document.getElementById("modalOtros").style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("borrarGastoOtros").onclick = () => {
    document.getElementById("nombreGastoOtros").value = "";
    document.getElementById("importeGastoOtros").value = "";
  };
});

let indiceGastoEditando = null;

function abrirModalEditarGasto(index) {
  const gasto = gastosConFecha[index];
  indiceGastoEditando = index;

  document.getElementById("editarImporteGasto").value = gasto.cantidad;
  document.getElementById("editarNombreGasto").value = gasto.categoria.includes("otros")
    ? gasto.categoria.replace("otros (", "").replace(")", "")
    : "";

  document.getElementById("modalEditarGasto").style.display = "block";
}

document.getElementById("guardarCambiosGasto").onclick = () => {
  const nuevoNombre = document.getElementById("editarNombreGasto").value.trim();
  const nuevoImporte = parseFloat(document.getElementById("editarImporteGasto").value);

  if (!isNaN(nuevoImporte) && nuevoImporte > 0 && indiceGastoEditando !== null) {
    const gastoOriginal = gastosConFecha[indiceGastoEditando];

    saldoFinal += gastoOriginal.cantidad;
    saldoFinal -= nuevoImporte;

    const categoriaOriginal = gastoOriginal.categoria.includes("otros") ? "otros" : gastoOriginal.categoria;
    categorias[categoriaOriginal] -= gastoOriginal.cantidad;
    
    gastosConFecha[indiceGastoEditando] = {
      ...gastoOriginal,
      cantidad: nuevoImporte,
      categoria: gastoOriginal.categoria.includes("otros")
        ? `otros (${nuevoNombre})`
        : gastoOriginal.categoria,
    };
    
    const categoriaNueva = gastosConFecha[indiceGastoEditando].categoria.includes("otros") ? "otros" : gastosConFecha[indiceGastoEditando].categoria;
    categorias[categoriaNueva] += nuevoImporte;
//actualizar el meses
    updateUI();
    mostrarHistorial();
    guardarDatos();

    document.getElementById("modalEditarGasto").style.display = "none";
    indiceGastoEditando = null;
  }
};

document.getElementById("xEditar").addEventListener("click", () => {
  document.getElementById("modalEditarGasto").style.display = "none";
  indiceGastoEditando = null;
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

function guardarDatosSinToast() {
  localStorage.setItem("saldoInicial", saldoInicial);
  localStorage.setItem("categorias", JSON.stringify(categorias));
  localStorage.setItem("saldoFinal", saldoFinal);

  if (gastosConFecha.length === 0) {
    localStorage.removeItem("gastosConFecha");
  } else {
    localStorage.setItem("gastosConFecha", JSON.stringify(gastosConFecha));
  }
}