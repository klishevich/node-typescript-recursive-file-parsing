export class Cat {
    public name: string;
    public age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    bark(): string {
        return "meaw meaw Cat";
    }
}
