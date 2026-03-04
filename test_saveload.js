import axios from "axios";

const API_URL = 'http://localhost:8080/api';

async function runTest() {
  const username = "testuser_" + Math.random().toString(36).substring(7);
  const password = "password123";

  try {
    console.log("1. 회원가입 및 로그인 시도...");
    let res = await axios.post(`${API_URL}/auth/register`, { username, password });
    console.log(" - 회원가입 성공:", res.data);

    res = await axios.post(`${API_URL}/auth/login`, { username, password });
    const token = res.data.token;
    console.log(" - 로그인 성공, 발급 토큰:", token.substring(0, 15) + "...");

    const headers = { Authorization: `Bearer ${token}` };

    console.log("\n2. 새로운 런(Run) 데이터 보존 시도...");
    const savePayload = {
      currentHp: 45, maxHp: 70, currentLayer: 2, gold: 120,
      deckJson: JSON.stringify([{id: 'c1', name: 'Strike'}]),
      relicsJson: JSON.stringify(['old_medkit']),
      runSeed: 'seed123', currentScene: 'SHOP', currentMapNode: 'f2-p1', isActive: true
    };
    let saveRes = await axios.post(`${API_URL}/run`, savePayload, { headers });
    console.log(" - 데이터 저장 완료. 반환 ID:", saveRes.data.runId);

    console.log("\n3. 저장된 데이터 로드 시도...");
    let loadRes = await axios.get(`${API_URL}/run`, { headers });
    const data = loadRes.data;
    console.log(" - 데이터 로드 완료:", { 
      hp: data.currentHp, gold: data.gold, scene: data.currentScene, 
      node: data.currentMapNode, active: data.isActive, seed: data.runSeed 
    });
    
    if(data.currentScene === 'SHOP' && data.runSeed === 'seed123') {
        console.log("\n✅ [테스트 성공] 런(Run) 데이터 확장 스키마가 정상 작동합니다!");
    } else {
        console.log("\n❌ [테스트 실패] 데이터 불일치");
    }

  } catch(e) {
    console.error("오류 발생:", e.response ? e.response.data : e.message);
  }
}

runTest();
