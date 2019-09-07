import IProfile from '../IProfile';

interface ITwitchProfile extends IProfile {
	display_name: string;
	profile_image_url: string;
}

export default ITwitchProfile;