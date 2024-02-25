import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Gender } from 'src/global/enum/gender.enum';
import { Genre } from 'src/global/enum/genre.enum';

export class CharacterCreationDTO {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsString()
  @IsNotEmpty()
  readonly title: string;
  @IsEnum(Genre)
  @IsNotEmpty()
  readonly genre: Genre; //make it enum
  @IsString()
  @IsNotEmpty()
  readonly creatorWords: string;
  @IsEnum(Gender)
  @IsNotEmpty()
  readonly gender: Gender; //make it...enum?
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
