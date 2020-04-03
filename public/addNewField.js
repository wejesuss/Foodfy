// Add new field 
function addIngredient() {
    const ingredients = document.querySelector("#ingredients")
    const fieldContainer = document.querySelectorAll(".ingredient")
    
    const newField = fieldContainer[fieldContainer.length - 1].cloneNode(
      true
    )
    
    if (newField.children[0].value == "") return false

    if (fieldContainer.length < 2) {
      const button = document.createElement('button')
      button.setAttribute('type', "button")
      button.classList.add('remove-ingredient')
      button.onclick = removeInputField
      button.innerHTML = "Apagar campo"

      newField.appendChild(button)
    } else {
      newField.children[1].onclick = removeInputField
    }

    newField.children[0].value = ""
    ingredients.appendChild(newField)
}

function addPreparation() {
    const ingredients = document.querySelector("#preparation");
    const fieldContainer = document.querySelectorAll(".preparation");
    
    const newField = fieldContainer[fieldContainer.length - 1].cloneNode(
      true
    );
    
    if (newField.children[0].value == "") return false;

    if (fieldContainer.length < 2) {
      const button = document.createElement('button')
      button.setAttribute('type', "button")
      button.classList.add('remove-preparation')
      button.onclick = removeInputField
      button.innerHTML = "Apagar campo"

      newField.appendChild(button)
    } else {
      newField.children[1].onclick = removeInputField
    }
  
    newField.children[0].value = ""; 
    ingredients.appendChild(newField);
}

function removeInputField(event) {
  const divIngredient = event.target.parentNode
  
  divIngredient.remove() 
}

  document
  .querySelector(".add-ingredient")
  .addEventListener("click", addIngredient);
  
  document
  .querySelector(".add-preparation")
  .addEventListener("click", addPreparation);
  