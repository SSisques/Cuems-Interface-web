import { UnixNamePipe } from './unix-name.pipe';

describe('UnixNamePipe', () => {
  it('create an instance', () => {
    const pipe = new UnixNamePipe();
    expect(pipe).toBeTruthy();
  });
});
