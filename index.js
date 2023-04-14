// la funcion tiene un nuemro entre minimo de o y maximo de 1 
function getRandomint(min, max){

    min = Math.ceil(min);
    max = Math.floor(max);
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
};