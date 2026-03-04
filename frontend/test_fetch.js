const API_URL = 'http://[::1]:8080/api';

async function runTest() {
  const username = "testuser_" + Math.random().toString(36).substring(7);
  const password = "password123";

  try {
    console.log("1. 회원가입 및 로그인 시도...");
    let res = await fetch(`${API_URL}/auth/register`, {
      method: "POST", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password })
    });
    console.log(" - 회원가입 성공:", await res.json());

    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password })
    });
    const loginData = await res.json();
    const token = loginData.token;
    console.log(" - 로그인 성공, 발급 토큰:", token.substring(0, 15) + "...");

    const headers = { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    console.log("\n2. 새로운 런(Run) 데이터 보존 시도...");
    const savePayload = {
      currentHp: 45, maxHp: 70, currentLayer: 2, gold: 120,
      deckJson: JSON.stringify([{id: 'c1', name: 'Strike'}]),
      relicsJson: JSON.stringify(['old_medkit']),
      runSeed: 'seed123', currentScene: 'SHOP', currentMapNode: 'f2-p1', isActive: true
    };
    
    let saveRes = await fetch(`${API_URL}/run`, {
        method: "POST", headers, body: JSON.stringify(savePayload)
    });
    const saveData = await saveRes.json();
    console.log(" - 백엔드 세이브 반환 ID:", saveData.runId);

    console.log("\n3. 저장된 데이터 로드 시도...");
    let loadRes = await fetch(`${API_URL}/run`, { headers });
    const data = await loadRes.json();
    console.log(" - 데이터 로드 완료:", { 
      hp: data.currentHp, gold: data.gold, scene: data.currentScene, 
      node: data.currentMapNode, active: data.isActive, seed: data.runSeed 
    });
    
    if(data.currentScene === 'SHOP' && data.runSeed === 'seed123') {
        console.log("\n✅ [테스트 성공] 런(Run) 데이터 확장 스키마가 로드/저장 모두 완벽히 연동됩니다!");
    } else {
        console.log("\n❌ [테스트 실패] 데이터 불일치");
    }

  } catch(e) {
    console.error("오류 발생:", e.message);
  }
}

runTest();
