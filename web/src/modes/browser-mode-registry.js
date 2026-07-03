(function(){
  const modes=[
    { id:'single-player', labelKey:'singlePlayer', enabled:true },
    { id:'two-player-race', labelKey:'twoPlayerRace', enabled:false }
  ];

  window.CleanGardenModes={
    listModes(){return modes.map(mode=>({...mode}));},
    getDefaultMode(){return modes[0].id;},
    hasMode(id){return modes.some(mode=>mode.id===id);}
  };
}());

