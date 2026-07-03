(function(){
  const singlePlayerMode={
    id:'single-player',
    labelKey:'singlePlayer',
    enabled:true,
    scoring:{
      trash:10,
      plant:25,
      bossDefeat:100,
      minionConvert:30,
      villainHit:15,
      levelComplete:attempt=>50+attempt.level*10,
    },
    objectives:[
      {
        id:'trash',
        labelKey:'trashLeft',
        icon:'🗑️',
        completeIcon:'✅',
        value:state=>String(state.trash.length),
        done:state=>state.trash.length===0,
      },
      {
        id:'trees',
        labelKey:'trees',
        icon:'🌱',
        completeIcon:'✅',
        value:state=>`${state.patches.filter(p=>p.planted).length}/${state.patches.length}`,
        done:state=>state.patches.every(p=>p.planted),
      },
      {
        id:'minions',
        labelKey:'minions',
        icon:'😈',
        completeIcon:'✅',
        value:state=>`${state.converted}/${state.quota}`,
        done:state=>state.converted>=state.quota,
      },
      {
        id:'boss',
        labelKey:'boss',
        icon:'🎩',
        completeIcon:'✅',
        value:()=> '',
        done:state=>state.spawnedBoss&&!state.boss,
      },
    ],
  };

  const modes=[
    singlePlayerMode,
    { id:'two-player-race', labelKey:'twoPlayerRace', enabled:false, scoring:{}, objectives:[] }
  ];

  window.CleanGardenModes={
    listModes(){return modes.map(mode=>({...mode}));},
    getDefaultMode(){return modes[0].id;},
    hasMode(id){return modes.some(mode=>mode.id===id);},
    getMode(id){return modes.find(mode=>mode.id===id)||modes[0];}
  };
}());
