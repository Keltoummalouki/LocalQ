import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createAnswerDto: CreateAnswerDto, @Req() req) {
    // récupère l'ID via le token
    const userId = req.user.userId || req.user._id;
    return this.answersService.create(createAnswerDto, userId);
  }

  @Get('question/:id')
  findByQuestion(@Param('id') id: string) {
    return this.answersService.findByQuestion(id);
  }
}