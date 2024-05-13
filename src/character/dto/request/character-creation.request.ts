import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CharacterCreationRequest {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsString()
  @IsNotEmpty()
  readonly title: string;
  @IsString()
  @IsNotEmpty()
  readonly genre: string;
  @IsString()
  @IsNotEmpty()
  readonly creatorWords: string;
  @IsString()
  @IsNotEmpty()
  readonly gender: string;
  @IsString()
  @IsNotEmpty()
  readonly appearance: string;
  @IsString()
  @IsNotEmpty()
  readonly personality: string;
  @IsString()
  @IsNotEmpty()
  readonly hobby: string;
  @IsString()
  @IsNotEmpty()
  readonly tone: string;
  @IsString()
  @IsNotEmpty()
  readonly extraInfo: string;
  @IsString()
  @IsNotEmpty()
  readonly summary: string;
  @IsString()
  @IsNotEmpty()
  readonly relationship: string;
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
