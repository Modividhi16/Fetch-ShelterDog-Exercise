const url = "https://frontend-take-home-service.fetch.com/auth/login";

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", postLoginData);

async function postLoginData(e) {
    e.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();

    try{
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email
            }),
            credentials: "include"
        });
        
        if(response.ok){
            const data = await response.text();
            if(data === "OK"){
               window.location.href = "search.html";
               console.log("Login Sucessfull");  
            }else{
               console.log("Unexpected response:", data);
            }
        }else{
            alert("Login failed. Please try again.")
        }  
    }catch(error){
        console.error(error);
    }   
}