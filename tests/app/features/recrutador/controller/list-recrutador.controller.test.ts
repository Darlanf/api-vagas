import { Recrutador } from "../../../../../src/app/models/recrutador.model";
import { UsuarioEntity } from "../../../../../src/app/shared/database/entities/usuario.entity";
import { JwtAdapter } from "../../../../../src/app/shared/util/jwt.adapter";
import { createApp } from "../../../../../src/main/config/express.config";
import { RedisConnection } from "../../../../../src/main/database/redis.connection";
import { TypeormConnection } from "../../../../../src/main/database/typeorm.connection";
import request from "supertest";

const makeAuth = async () => {
  const db = TypeormConnection.connection.manager;
  const recrutador = new Recrutador(
    "any_name",
    "any_username",
    "any_password",
    "any_empresa"
  );

  const user = await db.create(UsuarioEntity, {
    id: recrutador.id,
    nome: recrutador.nome,
    username: recrutador.username,
    password: recrutador.password,
    nomeEmpresa: recrutador.nomeEmpresa,
    tipo: recrutador.tipo,
  });

  await db.save(user);

  const jwt = JwtAdapter.createToken(user);
  return jwt;
};

const clearEntities = async () => {
  await TypeormConnection.connection.manager.delete(
    UsuarioEntity,
    {}
  );
};

describe("list recrutador controller tests", () => {
  let token: string;
  beforeAll(async () => {
    await TypeormConnection.init();
    await RedisConnection.connect();
    token = await makeAuth();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await clearEntities();
  });

  const app = createApp();

  test("Deveria retornar status 200 e uma lista de recrutadores", async () => {
    const res = await request(app)
      .get("/recrutador")
      .set("authorization", token)
      .send();

    expect(res).toBeDefined();
    expect(res).toHaveProperty("statusCode", 200);
    expect(res).toHaveProperty("body");
    expect(res.body).toHaveProperty("data");
  });
});
