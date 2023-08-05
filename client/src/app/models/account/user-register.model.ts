export interface UserRegister{
    email: string | null;
    password: string | null;
    confirmPassword: string | null;
    dateOfBirth: Date,
    knownAs: string,
    gender: string,
    introduction: string,
    lookingFor: string,
    interests: string,
    city: string,
    country: string
}