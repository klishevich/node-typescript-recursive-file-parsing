export class Dog {
    public name: string;
    public age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    bark(): string {
        return "bark bark Dog";
    }
}

export class Dog2 {
    public name: string;
    public age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    bark(): string {
        return "bark bark Dog2";
    }
}

class DogWithoutExport {
    public name: string;
    public age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    bark(): string {
        return "bark bark DogWithoutExport";
    }
}
