// this is an observable object
const person = observable({
    name: 'John',
    age: 20
})

function print(changedProp, oldVal, newVal) {
    console.log(changedProp, oldVal, newVal);
    render();
}

function render() {
    if (!person._template) {
        person._template = document.getElementById("app").innerHTML
        document.getElementById("app").remove();
    }
    document.getElementById("result").innerHTML = Handlebars.compile(person._template)(person);
}
// this creates an observer function
// outputs 'John, 20' to the console
observe(print)

// outputs 'Dave, 20' to the console
setInterval(function () {
    person.age = Math.random() * 1000;
}, 1000);

setInterval(function () {
    person.name = Math.random() * 10;
}, 3000);
person.name = 'Dave';

// outputs 'Dave, 22' to the console
person.age = 22;