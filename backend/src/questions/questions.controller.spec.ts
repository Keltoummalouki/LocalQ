import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

describe('QuestionsController', () => {
  let controller: QuestionsController;
  
  const mockQuestionsService = {
    create: jest.fn((dto) => Promise.resolve({ _id: '1', ...dto })),
    findAll: jest.fn(() => Promise.resolve([{ title: 'Test' }])),
    findOne: jest.fn((id) => Promise.resolve({ _id: id, title: 'Test' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
      ],
    }).compile();

    controller = module.get<QuestionsController>(QuestionsController);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner la liste des questions', async () => {
      const result = await controller.findAll();
      expect(result).toHaveLength(1);
      expect(mockQuestionsService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('doit créer une question', async () => {
      const dto = { title: 'Titre', content: 'Contenu', city: 'Nice', author: 'user1' };
      const result = await controller.create(dto);
      expect(result).toEqual({ _id: '1', ...dto });
      expect(mockQuestionsService.create).toHaveBeenCalledWith(dto);
    });
  });
});