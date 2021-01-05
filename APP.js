function handleInput() {
    var user = document.getElementById("user").value ;
    var token = document.getElementById("token").value !== "" ? document.getElementById("token").value : undefined;

    if (chart1 != null) chart1.destroy();
    if (chart2 != null) chart2.destroy();


    main(user, token);
}

// getRequest(url:string, token:string) -> data:json
async function getRequest(url, token) {

    const headers = {
        'Authorization': `Token ${token}`
    }

    const response = (token == undefined) ? await fetch(url) : await fetch(url, {
        "method": "GET",
        "headers": headers
    });

    let data = await response.json();
    return data;
}

// main(user:string, token:string) -> create_sidebar(user_info:json), get_language_pie(repo:json, user:string, token:string), get_commits_polarArea_multiaxis(repo:json, user:string, token:string), get_addition_deletion(repo:json, user:string, token:string)
async function main(user, token) {
    let url = `https://api.github.com/users/${user}/repos`;
    
    let repo = await getRequest(url, token).catch(error => console.error(error));

    url = `https://api.github.com/users/${user}`;
    let user_info = await getRequest(url, token).catch(error => console.error(error));
    
    create_sidebar(user_info);
    get_language_pie(repo, user, token);
    get_commits_polarArea(repo, user, token);
    get_addition_deletion_multiaxis(repo, user, token);
}

// create_sidebar(user_info:json) -> Display Sidebar
function create_sidebar(user_info) {
    let img = document.getElementById('img');
    img.src = user_info.avatar_url

    let name = document.getElementById('name');
    name.innerHTML = `<b>Name: </b>${user_info.name}`;

    let login = document.getElementById('login');
    login.innerHTML = `<b>Login ID: </b>${user_info.login}`;

    let bio = document.getElementById('bio');
    bio.innerHTML = `<b>Bio: </b>${user_info.bio == null ? 'User hasn\'t no bio :(' : user_info.bio}`;


    let created_at = document.getElementById('created_at');
    created_at.innerHTML = `<b>Created On: </b>${user_info.created_at}`;



    let location = document.getElementById('location');
    location.innerHTML = `<b>Location: </b>${user_info.location}`;

    let public_repos = document.getElementById('public_repos');
    public_repos.innerHTML = `<b>Number of Repos: </b>${user_info.public_repos}`;
}

// get_commits_polarArea(repo:json, user:string, token:string) -> Display polarArea Graph
async function get_commits_polarArea(repo, user, token) {
    let label = [];
    let data = [];
    let backgroundColor = [];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (i in repo) {
        let url = `https://api.github.com/repos/${user}/${repo[i].name}/commits?per_page=100`;
        let commits = await getRequest(url, token).catch(error => console.error(error));

        for (j in commits) {
            let date = commits[j].commit.author.date;

            var d = new Date(date);
            let day = days[d.getDay()];

            if (label.includes(day)) {
                for (i = 0; i < label.length; i++)
                    if (day == label[i])
                        data[i] += 1;

            } else {
                label.push(day);
                data.push(1);
                backgroundColor.push(`rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.2)`);
            }
        }

    }

    draw1('commits', 'bar', 'commits', ` ${user} Commits Weekly `, label, data, backgroundColor);
}

// get_language_pie(repo:json, user:string, token:string) -> Display pie Graph
async function get_language_pie(repo, user, token) {
    let label = [];
    let data = [];
    let backgroundColor = [];

    for (i in repo) {
        let url = `https://api.github.com/repos/${user}/${repo[i].name}/languages`;
        let languages = await getRequest(url, token).catch(error => console.error(error));

        for (language in languages) {

            if (label.includes(language)) {
                for (i = 0; i < label.length; i++)
                    if (language == label[i])
                        data[i] = data[i] + languages[language];

            } else {
                label.push(language);
                data.push(languages[language]);
                backgroundColor.push(`rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.2)`);
            }
        }

    }

    draw2('language', 'polarArea', 'languages', ` Programming Languages Preference`, label, data, backgroundColor);
}


// draw1(...) -> draws first graph
function draw1(ctx, type, datasetLabel, titleText, label, data, backgroundColor) {

    let myChart = document.getElementById(ctx).getContext('2d');

    chart1 = new Chart(myChart, {
        type: type,
        data: {
            labels: label,
            datasets: [{
                label: datasetLabel,
                data: data,
                backgroundColor: backgroundColor,
                borderWidth: 1,
                borderColor: '#777',
                hoverBorderWidth: 2,
                hoverBorderColor: '#000'
            }],

        },
        options: {
            title: {
                display: true,
                text: titleText,
                fontSize: 20
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    fontColor: '#000'
                }
            },
            layout: {
                padding: {
                    left: 50,
                    right: 0,
                    bottom: 0,
                    top: 0
                }
            },
            tooltips: {
                enabled: true
            }
        }
    });
}

// draw2(...) -> draws second graph
function draw2(ctx, type, datasetLabel, titleText, label, data, backgroundColor) {

    let myChart = document.getElementById(ctx).getContext('2d');

    chart2 = new Chart(myChart, {
        animationEnabled: true,
        type: type,
        data: {
            labels: label,
            startAngle: 60,
		    //innerRadius: 60,
		    indexLabelFontSize: 17,
		    indexLabel: "{label} - #percent%",
		    toolTipContent: "<b>{label}:</b> {y} (#percent%)",
            datasets: [{
                label: datasetLabel,
                data: data,
                backgroundColor: backgroundColor,
                borderWidth: 1,
                borderColor: '#333',
                hoverBorderWidth: 2,
                hoverBorderColor: '#000'
            }],

        },
        options: {
            title: {
                display: true,
                text: titleText,
                fontSize: 20
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    fontColor: '#000'
                }
            },
            layout: {
                padding: {
                    left: 50,
                    right: 0,
                    bottom: 0,
                    top: 0
                }
            },
            tooltips: {
                enabled: true
            }
        }
    });
}



var chart1 = null;
var chart2 = null;
