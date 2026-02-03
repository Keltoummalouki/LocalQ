import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

describe('QuestionsController', () => {
  let controller: QuestionsController;

  const mockQuestionsService = {
    // On simule que le service renvoie l'objet qu'on lui donne, avec un _id en plus
    create: jest.fn((dto) => Promise.resolve({ _id: 'new_id', ...dto })),
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
    it('doit créer une question en attachant l\'ID de l\'auteur connecté', async () => {
      // Les données envoyées par le formulaire (sans l'auteur)
      const dto = { 
        title: 'Titre Test', 
        content: 'Contenu Test', 
        city: 'Paris', 
        author: '' // Le DTO initial peut avoir ce champ vide ou absent
      };

      // La simulation de la requête avec l'utilisateur connecté (via JWT)
      const mockRequest = {
        user: { _id: 'user_123' } // L'ID qui vient du token
      };

      // appelle la méthode du contrôleur avec les DEUX arguments
      const result = await controller.create(dto, mockRequest);

      // On s'attend à ce que le résultat contienne l'ID de l'user_123
      expect(result).toEqual({ 
        _id: 'new_id', 
        ...dto, 
        author: 'user_123' 
      });

      // vérifie que le service a été appelé avec l'objet fusionné
      expect(mockQuestionsService.create).toHaveBeenCalledWith({
        ...dto,
        author: 'user_123', // Le contrôleur a bien fait son travail d'injection !
      });
    });
  });
});