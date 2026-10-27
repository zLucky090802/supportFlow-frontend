import { AdminDemoStore } from './admin-demo.store';
describe('Administration demo store',()=>{
  let store:AdminDemoStore;beforeEach(()=>store=new AdminDemoStore());
  it('blocks moving or suspending a user with open conversations',()=>{
    const original=store.users();expect(store.changeUser(1,'move','sales')).toBeFalse();expect(store.changeUser(1,'status')).toBeFalse();expect(store.users()).toBe(original);
  });
  it('protects self, global access and pending invitations from all actions',()=>{
    for(const id of [2,5]){expect(store.changeUser(id,'role','Agente')).toBeFalse();expect(store.changeUser(id,'move','success')).toBeFalse();expect(store.changeUser(id,'status')).toBeFalse();}
    expect(store.changeUser(4,'role','Administrador global')).toBeFalse();expect(store.changeUser(999,'status')).toBeFalse();
  });
  it('changes eligible membership without changing active workspace or other users',()=>{
    expect(store.changeUser(4,'move','success')).toBeTrue();expect(store.memberCount('success')).toBe(2);expect(store.memberCount('sales')).toBe(1);expect(store.activeTeamId()).toBe('support');expect(store.users().find(u=>u.id===4)?.role).toBe('Administrador de equipo');expect(store.changeUser(4,'move','missing')).toBeFalse();
  });
  it('changes roles and reactivates suspended users locally',()=>{
    expect(store.changeUser(6,'status')).toBeTrue();expect(store.users().find(u=>u.id===6)?.status).toBe('Activo');expect(store.changeUser(6,'role','Administrador de equipo')).toBeTrue();expect(store.changeUser(6,'status')).toBeTrue();expect(store.users().find(u=>u.id===6)?.status).toBe('Suspendido');
  });
  it('rejects blank, duplicate and oversized team input and trims saved names',()=>{
    for(const name of [' ','  COMERCIAL ','a'.repeat(61)])expect(store.saveTeam(null,name,'')).not.toBeNull();
    expect(store.saveTeam(null,'Posventa','a'.repeat(181))).not.toBeNull();expect(store.saveTeam(null,' Posventa ',' Acompañamiento ')).toBeNull();expect(store.teams().length).toBe(4);expect(store.teams()[3].name).toBe('Posventa');expect(store.memberCount(store.teams()[3].id)).toBe(0);
  });
  it('updates active team name when edited and keeps switching separate from membership',()=>{
    const users=store.users();expect(store.switchTeam('sales')).toBeTrue();expect(store.activeTeam().name).toBe('Comercial');expect(store.saveTeam('sales','Ventas','')).toBeNull();expect(store.activeTeam().name).toBe('Ventas');expect(store.users()).toBe(users);expect(store.switchTeam('missing')).toBeFalse();
    store.saveTeam(null,'Nuevo','');expect(store.switchTeam(store.teams()[3].id)).toBeFalse();
  });
});
