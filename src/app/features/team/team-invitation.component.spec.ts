import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TeamInvitationComponent } from './team-invitation.component';
import { TEAM_MEMBERS } from './team.data';

describe('Team invitation', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [provideRouter([{ path: 'team/invitar', component: TeamInvitationComponent }])],
  }));

  it('rejects empty, malformed and oversized email addresses', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/team/invitar', TeamInvitationComponent);
    for (const email of ['', '   ', 'invalid', 'a@@example.com', `${'a'.repeat(250)}@example.com`]) {
      page.form.controls.email.setValue(email); page.invite(); harness.detectChanges();
      expect(page.form.invalid).toBeTrue();
      expect(page.feedback()).toBe('');
      expect(harness.routeNativeElement!.querySelector('#invite-error')).not.toBeNull();
    }
  });

  it('rejects members and pending invitations ignoring case and surrounding whitespace', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/team/invitar', TeamInvitationComponent);
    for (const member of TEAM_MEMBERS) {
      page.form.controls.email.setValue(` ${member.email.toUpperCase()} `); page.invite();
      expect(page.duplicate()).toBeTrue();
      expect(page.feedback()).toContain('ya pertenece al equipo');
    }
    page.form.controls.email.setValue('new@example.com');
    expect(page.duplicate()).toBeFalse(); expect(page.feedback()).toBe('');
  });

  it('submits through the form with a clear simulation message and does not mutate the team', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/team/invitar', TeamInvitationComponent);
    const original = JSON.stringify(TEAM_MEMBERS);
    const input = harness.routeNativeElement!.querySelector<HTMLInputElement>('#invite-email')!;
    input.value = 'new@example.com'; input.dispatchEvent(new Event('input'));
    harness.routeNativeElement!.querySelector<HTMLFormElement>('form.panel')!.dispatchEvent(new Event('submit', { cancelable: true }));
    harness.detectChanges();
    expect(page.feedback()).toContain('Invitación simulada para new@example.com');
    expect(harness.routeNativeElement!.querySelector('#invite-feedback')?.textContent).toContain('No se envió ningún correo');
    expect(JSON.stringify(TEAM_MEMBERS)).toBe(original);
    expect(harness.routeNativeElement!.querySelector('a.back')?.getAttribute('href')).toBe('/team');
  });

  it('updates the proposed role description and supports compact navigation', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/team/invitar', TeamInvitationComponent);
    page.form.controls.role.setValue('Administrador'); harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('#role-description')?.textContent).toContain('gestiona el espacio de trabajo');
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('app-sidebar .collapse')!.click(); harness.detectChanges();
    expect(page.compact()).toBeTrue();
  });
});
