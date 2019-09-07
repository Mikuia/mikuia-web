import IProfile from '../IProfile';

interface IDiscordProfile extends IProfile {
	avatar: string;
	discriminator: number;
	username: string;
}

export default IDiscordProfile;