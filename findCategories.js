(function() {
    let categories = [];
    let categoryStrings = ['potpourriiii', 'stupid answers', 'sports', 'animals', '3 letter words', 'science', 'transportation', 'u.s. cities', 'people', 'television'];
    let categoryIds = [306, 136, 42, 21, 25, 103, 7, 442, 67];
    let url = "http://jservice.io/api/category?id="
    count = 0;

    for(let i = 1; i < 1000; i++){
        fetch(url + i.toString())
        .then((response) =>{
            return response.json();
        })
        .then((data) =>{
            if(data['status'] === "404"){
                count++;
            }
            if(categoryStrings.includes(data['title'])){
                categories.push([data['title'], data['id']]);
            }
            localStorage.categories = categories;
        })
    }
})();